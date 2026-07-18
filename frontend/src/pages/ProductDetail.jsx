import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { formatPrice } from "../utils/format";
import ProductCard from "../components/ProductCard";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          className={`text-lg ${n <= value ? "text-brass" : "text-ink/20"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ slug }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.get(`/products/${slug}/reviews`).then((data) => setReviews(data.reviews));
  }

  useEffect(load, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/products/${slug}/reviews`, { rating, comment });
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Reviews</h2>

      {reviews === null ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-ink/50 text-sm mb-8">No reviews yet — be the first.</p>
      ) : (
        <div className="space-y-6 mb-10">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-ink/10 pb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-sm">{r.userName}</p>
                <StarRating value={r.rating} />
              </div>
              <p className="text-sm text-ink/70">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Leave a review
          </p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            required
            placeholder="What did you think?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm"
            rows={3}
          />
          {error && <p className="text-oxblood text-sm">{error}</p>}
          <button
            disabled={submitting}
            className="border border-ink px-5 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink/50">Sign in to leave a review.</p>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setProduct(null);
    setActiveImage(0);
    api
      .get(`/products/${slug}`)
      .then((data) => {
        setProduct(data.product);
        const firstVariant = data.product.variants[0];
        if (firstVariant) {
          setSize(firstVariant.size);
          setColor(firstVariant.color);
        }
      })
      .catch(() => setError("This piece isn't available anymore."));

    api
      .get(`/products/${slug}/related`)
      .then((data) => setRelated(data.items))
      .catch(() => setRelated([]));
  }, [slug]);

  if (error) {
    return <p className="max-w-7xl mx-auto px-6 py-24 text-center text-ink/50">{error}</p>;
  }
  if (!product) {
    return <p className="max-w-7xl mx-auto px-6 py-24 text-center text-ink/50">Loading…</p>;
  }

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const selectedVariant = product.variants.find((v) => v.size === size && v.color === color);
  const onSale = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const saved = isWishlisted(product._id);

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock < 1) return;
    addItem(product, size, color, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleWishlistClick() {
    if (!user) {
      navigate("/login");
      return;
    }
    await toggle(product._id);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="depth-layer aspect-[4/5] bg-paperDim overflow-hidden mb-3">
            <img
              src={product.images?.[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-20 overflow-hidden border-2 ${
                    i === activeImage ? "border-oxblood" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-2">
                {product.brand}
              </p>
              <h1 className="font-display text-4xl mb-2">{product.name}</h1>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating value={Math.round(product.rating)} />
                  <span className="text-xs text-ink/50">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleWishlistClick}
              aria-label={saved ? "Remove from saved" : "Save for later"}
              className="w-11 h-11 rounded-full border border-ink/20 flex items-center justify-center shrink-0 hover:border-oxblood transition-colors"
            >
              <span className={saved ? "text-oxblood" : "text-ink/50"}>{saved ? "♥" : "♡"}</span>
            </button>
          </div>

          <div className="font-mono text-lg mb-6">
            {onSale && (
              <span className="line-through text-ink/40 mr-3">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
            <span className={onSale ? "text-oxblood" : ""}>{formatPrice(product.priceCents)}</span>
          </div>

          <p className="text-ink/70 mb-8 leading-relaxed">{product.description}</p>

          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-widest mb-2 text-ink/50">Color</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-3 py-1.5 border text-sm ${
                    color === c ? "border-ink bg-ink text-paper" : "border-ink/20"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest mb-2 text-ink/50">Size</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s) => {
                const variant = product.variants.find((v) => v.size === s && v.color === color);
                const available = variant && variant.stock > 0;
                return (
                  <button
                    key={s}
                    disabled={!available}
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 border text-sm ${
                      size === s ? "border-ink bg-ink text-paper" : "border-ink/20"
                    } ${!available ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock < 1}
            className="w-full bg-ink text-paper py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-3"
          >
            {!selectedVariant || selectedVariant.stock < 1
              ? "Out of stock"
              : added
              ? "Added to cart ✓"
              : "Add to cart"}
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="w-full border border-ink py-4 font-mono text-xs uppercase tracking-widest hover:bg-paperDim transition-colors"
          >
            View cart
          </button>

          {product.materials?.length > 0 && (
            <>
              <hr className="seam-divider" />
              <p className="font-mono text-xs uppercase tracking-widest mb-2 text-ink/50">Materials</p>
              <p className="text-sm text-ink/70">{product.materials.join(", ")}</p>
            </>
          )}
        </div>
      </div>

      <hr className="seam-divider" />
      <ReviewsSection slug={slug} />

      {related.length > 0 && (
        <>
          <hr className="seam-divider" />
          <h2 className="font-display text-2xl mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
