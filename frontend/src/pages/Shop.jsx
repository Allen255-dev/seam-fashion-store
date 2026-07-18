import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { formatPrice } from "../utils/format";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["outerwear", "tops", "bottoms", "dresses", "knitwear", "footwear", "accessories"];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams(searchParams);
    query.set("page", page);

    api
      .get(`/products?${query.toString()}`)
      .then((data) => {
        setItems(data.items);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      api
        .get(`/products/suggestions?q=${encodeURIComponent(searchInput)}`)
        .then((data) => setSuggestions(data.items))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setShowSuggestions(false);
    updateParam("search", searchInput);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-2">
            {pagination ? `${pagination.total} pieces` : " "}
          </p>
          <h1 className="font-display text-4xl">Shop the collection</h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search products…"
              className="border border-ink/20 bg-transparent px-4 py-2 text-sm w-56 focus:border-oxblood outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-paper border border-ink/10 shadow-lg z-40">
                {suggestions.map((s) => (
                  <Link
                    key={s._id}
                    to={`/product/${s.slug}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-paperDim text-sm"
                  >
                    <img src={s.images?.[0]} alt="" className="w-8 h-10 object-cover shrink-0" />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="font-mono text-xs text-ink/50 shrink-0">
                      {formatPrice(s.priceCents)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-10 font-mono text-xs uppercase tracking-widest">
        <button
          onClick={() => updateParam("category", "")}
          className={`px-3 py-1.5 border transition-colors ${
            !category ? "bg-oxblood text-paper border-oxblood" : "border-ink/20 hover:border-sage"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => updateParam("category", c)}
            className={`px-3 py-1.5 border transition-colors ${
              category === c
                ? "bg-oxblood text-paper border-oxblood"
                : "border-ink/20 hover:border-sage"
            }`}
          >
            {c}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="ml-auto border border-ink/20 bg-transparent px-3 py-1.5 normal-case"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {loading ? (
        <p className="text-ink/50 text-center py-24">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-ink/50 text-center py-24">
          No pieces match that search. Try a different term or filter.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-14 font-mono text-xs">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", p);
                setSearchParams(next);
              }}
              className={`w-8 h-8 border ${
                Number(page) === p ? "bg-ink text-paper border-ink" : "border-ink/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
