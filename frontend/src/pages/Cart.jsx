import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <p className="text-ink/60 mb-8">Nothing here yet. Go find something worth keeping.</p>
        <Link
          to="/shop"
          className="inline-block bg-ink text-paper px-8 py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-10">Your cart</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.size}-${item.color}`}
            className="flex gap-5 pb-6 border-b border-ink/10"
          >
            <div className="w-24 h-28 bg-paperDim shrink-0 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                {item.brand}
              </p>
              <h3 className="font-display text-lg">{item.name}</h3>
              <p className="text-sm text-ink/60">
                {item.size} / {item.color}
              </p>
              <button
                onClick={() => removeItem(item.productId, item.size, item.color)}
                className="font-mono text-xs uppercase tracking-widest text-oxblood mt-2"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className="font-mono text-sm">{formatPrice(item.priceCents * item.quantity)}</p>
              <div className="flex items-center border border-ink/20">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                  }
                  className="w-8 h-8 hover:bg-paperDim"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                  }
                  className="w-8 h-8 hover:bg-paperDim"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          Subtotal · shipping and tax calculated at checkout
        </p>
        <p className="font-display text-2xl">{formatPrice(subtotalCents)}</p>
      </div>

      <Link
        to="/checkout"
        className="mt-8 block text-center bg-ink text-paper py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
