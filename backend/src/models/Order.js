import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    size: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String, required: true },
    unitPriceCents: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestEmail: { type: String, lowercase: true, trim: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotalCents: { type: Number, required: true },
    shippingCents: { type: Number, required: true, default: 0 },
    taxCents: { type: Number, required: true, default: 0 },
    discountCents: { type: Number, required: true, default: 0 },
    couponCode: { type: String },
    totalCents: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "fulfilled", "cancelled", "refunded"],
      default: "pending_payment",
    },
    stripeCheckoutSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function (next) {
  if (!this.user && !this.guestEmail) {
    return next(new Error("Order must have either a user or a guest email"));
  }
  next();
});

export default mongoose.model("Order", orderSchema);
