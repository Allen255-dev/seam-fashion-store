import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatPrice } from "../utils/format";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Plus } from "lucide-react";

export default function ProductCard({ product }) {
  const onSale = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showSizes, setShowSizes] = useState(false);
  const saved = isWishlisted(product._id);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
    setShowSizes(false); // Reset sizes menu when mouse leaves
  }

  async function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    await toggle(product._id);
  }

  function handleQuickAddClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const uniqueSizes = [...new Set(product.variants?.map((v) => v.size) || [])];
    if (uniqueSizes.length === 1) {
      const v = product.variants[0];
      addItem(product, v.size, v.color, 1);
    } else {
      setShowSizes(true);
    }
  }

  function handleSizeSelect(e, size) {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.find((v) => v.size === size);
    if (variant) {
      addItem(product, variant.size, variant.color, 1);
      setShowSizes(false);
    }
  }

  const uniqueSizes = [...new Set(product.variants?.map((v) => v.size) || [])];

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        className="tilt-card relative aspect-[4/5] overflow-hidden bg-paperDim mb-3 ring-1 ring-transparent group-hover:ring-brass"
      >
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Second image for hover swap */}
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        )}
        
        <div className="absolute top-0 right-0 bg-sage text-paper tag-corner px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest z-10">
          {product.category}
        </div>
        {onSale && (
          <div className="absolute bottom-3 left-3 bg-oxblood text-paper px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest z-10">
            Sale
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={saved ? "Remove from saved" : "Save for later"}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-paper/90 flex items-center justify-center text-sm hover:scale-110 transition-transform z-10"
        >
          <span className={saved ? "text-oxblood" : "text-ink/50"}>{saved ? "♥" : "♡"}</span>
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute bottom-4 right-4 flex justify-end z-20">
          {!showSizes ? (
            <button
              onClick={handleQuickAddClick}
              className="w-10 h-10 bg-paper/95 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-ink hover:text-paper shadow-sm"
              aria-label="Quick add"
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <div className="bg-paper/95 p-1 rounded-full flex items-center gap-1 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              {uniqueSizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleSizeSelect(e, size)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] hover:bg-ink hover:text-paper transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-0.5">
            {product.brand}
          </p>
          <h3 className="font-display text-lg leading-tight">{product.name}</h3>
        </div>
        <div className="text-right font-mono text-sm shrink-0 pl-3">
          {onSale && (
            <span className="line-through text-ink/40 mr-2">
              {formatPrice(product.compareAtPriceCents)}
            </span>
          )}
          <span className={onSale ? "text-oxblood" : ""}>{formatPrice(product.priceCents)}</span>
        </div>
      </div>
    </Link>
  );
}
