import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Nothing saved yet</h1>
        <p className="text-ink/60 mb-8">
          Tap the heart on any product to keep track of pieces you're considering.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-ink text-paper px-8 py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl mb-10">Saved pieces</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
