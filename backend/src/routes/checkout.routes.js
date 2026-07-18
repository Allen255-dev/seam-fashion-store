import { Router } from "express";
import Stripe from "stripe";
import validator from "validator";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SHIPPING_FLAT_CENTS = 800;
const TAX_RATE = 0.08;

// POST /api/checkout/session
// body: { items, shippingAddress, guestEmail?, couponCode? }
// Works for both logged-in users (via optionalAuth) and guests (guestEmail required if not logged in).
router.post("/session", optionalAuth, async (req, res, next) => {
  try {
    const { items, shippingAddress, guestEmail, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }
    if (!req.user && !guestEmail) {
      return res.status(400).json({ error: "Email is required to check out as a guest" });
    }
    if (guestEmail && !validator.isEmail(guestEmail)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }

    const orderItems = [];
    let subtotalCents = 0;

    for (const line of items) {
      const product = await Product.findById(line.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ error: `Product no longer available` });
      }
      const variant = product.variants.find(
        (v) => v.size === line.size && v.color === line.color
      );
      if (!variant) {
        return res.status(400).json({ error: `${product.name} — that size/color is unavailable` });
      }
      if (variant.stock < line.quantity) {
        return res.status(400).json({ error: `${product.name} (${line.size}/${line.color}) is out of stock` });
      }

      const lineTotal = product.priceCents * line.quantity;
      subtotalCents += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0],
        size: line.size,
        color: line.color,
        sku: variant.sku,
        unitPriceCents: product.priceCents,
        quantity: line.quantity,
      });
    }

    let discountCents = 0;
    let appliedCouponCode;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (!coupon) {
        return res.status(400).json({ error: "That promo code isn't valid" });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ error: "That promo code has expired" });
      }
      discountCents = coupon.computeDiscountCents(subtotalCents);
      appliedCouponCode = coupon.code;
    }

    const shippingCents = SHIPPING_FLAT_CENTS;
    const taxableAmount = Math.max(0, subtotalCents - discountCents);
    const taxCents = Math.round(taxableAmount * TAX_RATE);
    const totalCents = taxableAmount + shippingCents + taxCents;

    const order = await Order.create({
      user: req.user?._id,
      guestEmail: req.user ? undefined : guestEmail.toLowerCase(),
      items: orderItems,
      shippingAddress,
      subtotalCents,
      shippingCents,
      taxCents,
      discountCents,
      couponCode: appliedCouponCode,
      totalCents,
      status: "pending_payment",
    });

    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: `${item.name} (${item.size} / ${item.color})` },
        unit_amount: item.unitPriceCents,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user?.email || guestEmail,
      line_items: lineItems,
      discounts: discountCents > 0
        ? [
            {
              coupon: (
                await stripe.coupons.create({
                  amount_off: discountCents,
                  currency: "usd",
                  duration: "once",
                  name: appliedCouponCode,
                })
              ).id,
            },
          ]
        : undefined,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "usd" },
            display_name: "Standard shipping",
          },
        },
      ],
      automatic_tax: { enabled: false },
      success_url: `${process.env.CLIENT_URL}/order-confirmation?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: { orderId: order._id.toString() },
    });

    order.stripeCheckoutSessionId = session.id;
    await order.save();

    res.json({ checkoutUrl: session.url, orderId: order._id });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook — mounted with express.raw() body parser in server.js
export async function stripeWebhookHandler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe] webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status === "pending_payment") {
        order.status = "paid";
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product, "variants.sku": item.sku },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        }

        // Order confirmation email
        const recipient = order.guestEmail || session.customer_email;
        const formattedTotal = (order.totalCents / 100).toFixed(2);
        const subject = `Order Confirmation - #${order._id.toString().slice(-8)}`;
        const message = `Thank you for your order!\n\nYour order #${order._id.toString().slice(-8)} for $${formattedTotal} has been successfully placed.`;
        const htmlMessage = `<h3>Thank you for your order!</h3><p>Your order <strong>#${order._id.toString().slice(-8)}</strong> for <strong>$${formattedTotal}</strong> has been successfully placed.</p>`;
        
        await sendEmail({
          email: recipient,
          subject,
          message,
          htmlMessage,
        });

        console.log(
          `\n[order confirmation] Would email ${recipient} — order #${order._id.toString().slice(-8)}, total $${formattedTotal}\n`
        );
      }
    }
  }

  res.json({ received: true });
}

export default router;
