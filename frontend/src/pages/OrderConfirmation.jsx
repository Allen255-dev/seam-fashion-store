import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-4">
        Order confirmed
      </p>
      <h1 className="font-display text-4xl mb-6">Thank you for your order.</h1>
      <p className="text-ink/60 mb-2">
        Your payment has been received and your order is being prepared.
      </p>
      {orderId && (
        <p className="font-mono text-xs text-ink/40 mb-10">Order reference: {orderId}</p>
      )}
      <div className="flex gap-4 justify-center">
        <Link
          to="/orders"
          className="bg-ink text-paper px-8 py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors"
        >
          View order status
        </Link>
        <Link
          to="/shop"
          className="border border-ink px-8 py-3 font-mono text-xs uppercase tracking-widest hover:bg-paperDim transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
