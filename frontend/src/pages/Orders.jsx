import { useEffect, useState } from "react";
import { api } from "../api/client";
import { formatPrice } from "../utils/format";

const STATUS_LABELS = {
  pending_payment: "Payment pending",
  paid: "Paid — preparing",
  fulfilled: "Shipped",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders").then((data) => setOrders(data.orders));
  }, []);

  if (!orders) {
    return <p className="max-w-4xl mx-auto px-6 py-24 text-center text-ink/50">Loading…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">No orders yet</h1>
        <p className="text-ink/60">Your order history will show up here once you check out.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-10">Your orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border border-ink/10 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="font-mono text-xs text-ink/40">#{order._id.slice(-8)}</p>
              </div>
              <span className="font-mono text-xs uppercase tracking-widest px-3 py-1 border border-ink/20">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.name} ({item.size}/{item.color}) × {item.quantity}
                  </span>
                  <span className="font-mono">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-mono text-sm border-t border-ink/10 pt-3">
              <span className="text-ink/50">Total</span>
              <span>{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
