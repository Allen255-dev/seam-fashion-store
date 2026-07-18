import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { formatPrice } from "../utils/format";

const emptyAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

export default function Checkout() {
  const { items, subtotalCents } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [guestEmail, setGuestEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await api.post("/checkout/session", {
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        shippingAddress: address,
        guestEmail: user ? undefined : guestEmail,
        couponCode: couponCode || undefined,
      });
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="font-display text-3xl mb-8">Shipping details</h1>

        {!user && (
          <div className="mb-6 p-4 border border-sage/40 bg-sage/10 text-sm">
            Checking out as a guest.{" "}
            <Link to="/login" className="text-oxblood underline">
              Sign in
            </Link>{" "}
            for faster checkout next time and order tracking.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <input
              required
              type="email"
              placeholder="Email (for order confirmation)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
            />
          )}
          <input
            required
            placeholder="Full name"
            value={address.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
          />
          <input
            required
            placeholder="Address line 1"
            value={address.line1}
            onChange={(e) => updateField("line1", e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
          />
          <input
            placeholder="Address line 2 (optional)"
            value={address.line2}
            onChange={(e) => updateField("line2", e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="City"
              value={address.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
            />
            <input
              placeholder="State / Province"
              value={address.state}
              onChange={(e) => updateField("state", e.target.value)}
              className="border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Postal code"
              value={address.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              className="border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
            />
            <input
              required
              placeholder="Country"
              value={address.country}
              onChange={(e) => updateField("country", e.target.value)}
              className="border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
            />
          </div>

          <input
            placeholder="Promo code (optional)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none font-mono uppercase"
          />

          {error && <p className="text-oxblood text-sm">{error}</p>}

          <button
            disabled={submitting}
            className="w-full bg-ink text-paper py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-50"
          >
            {submitting ? "Redirecting to payment…" : "Continue to payment"}
          </button>
          <p className="text-xs text-ink/40 text-center">
            You'll be redirected to Stripe to complete payment securely.
          </p>
        </form>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-6">Order summary</h2>
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
              <div className="w-16 h-20 bg-paperDim shrink-0 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-ink/50">
                  {item.size} / {item.color} × {item.quantity}
                </p>
              </div>
              <p className="font-mono text-sm">{formatPrice(item.priceCents * item.quantity)}</p>
            </div>
          ))}
        </div>
        <hr className="seam-divider" />
        <div className="flex justify-between font-mono text-sm mb-2">
          <span>Subtotal</span>
          <span>{formatPrice(subtotalCents)}</span>
        </div>
        <p className="text-xs text-ink/40">
          Shipping, tax, and any promo code discount are calculated on the payment page.
        </p>
      </div>
    </div>
  );
}
