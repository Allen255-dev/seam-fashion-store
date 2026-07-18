import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ThreeHero from "../components/ThreeHero";

const MARQUEE_ITEMS = [
  "New Arrivals", "•", "Outerwear", "•", "Knitwear", "•",
  "Footwear", "•", "Accessories", "•", "Limited Editions", "•",
  "New Arrivals", "•", "Outerwear", "•", "Knitwear", "•",
  "Footwear", "•", "Accessories", "•", "Limited Editions", "•",
];

const CATEGORIES = [
  {
    label: "Outerwear",
    href: "/shop?category=outerwear",
    img: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
    count: "12 styles",
  },
  {
    label: "Knitwear",
    href: "/shop?category=knitwear",
    img: "https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600&q=80",
    count: "8 styles",
  },
  {
    label: "Footwear",
    href: "/shop?category=footwear",
    img: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80",
    count: "6 styles",
  },
  {
    label: "Accessories",
    href: "/shop?category=accessories",
    img: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80",
    count: "14 styles",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const heroImgRef = useRef(null);

  useEffect(() => {
    api
      .get("/products/featured")
      .then((data) => setFeatured(data.items))
      .catch(() => setFeatured([]));
  }, []);

  // Subtle parallax on hero image
  useEffect(() => {
    function handleScroll() {
      if (!heroImgRef.current) return;
      const y = window.scrollY;
      heroImgRef.current.style.transform = `translateY(${y * 0.18}px) scale(1.08)`;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[640px] flex items-end overflow-hidden bg-[#0a0905]">

        {/* Full-bleed background photo with parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            ref={heroImgRef}
            src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1800&q=85"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-top scale-105 transition-none"
          />
          {/* Dark gradient overlay — bottom-weighted so text is legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
        </div>

        {/* Three.js layer — layered above photo, transparent canvas */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <ThreeHero className="w-full h-full" />
        </div>

        {/* Hero copy — bottom-left editorial layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 md:pb-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50 mb-5">
              Autumn / Winter — Collection 04
            </p>
            <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] text-white mb-7 drop-shadow-2xl">
              Clothes that<br />hold their shape.
            </h1>
            <p className="text-white/65 text-[1.05rem] leading-relaxed mb-10 max-w-md">
              Small runs. Real fiber. Honest construction. Built to be worn
              until it's worn in — not discarded when the season turns.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                id="hero-cta-shop"
                className="inline-block bg-white text-[#0a0905] px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-[#c4a97e] hover:text-white transition-colors duration-300"
              >
                Shop the collection
              </Link>
              <Link
                to="/shop?category=outerwear"
                id="hero-cta-outerwear"
                className="inline-block border border-white/40 text-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Outerwear
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute right-6 bottom-0 hidden md:flex flex-col items-center gap-2 text-white/30">
            <span className="font-mono text-[9px] uppercase tracking-widest rotate-90 mb-4 origin-center">Scroll</span>
            <div className="w-px h-16 bg-white/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-white/60 animate-scroll-line" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Ticker tape ────────────────────────────────────────────────── */}
      <div className="bg-[#0a0905] border-y border-white/8 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {MARQUEE_ITEMS.map((item, i) => (
            <span
              key={i}
              className={`font-mono text-[10px] uppercase tracking-[0.25em] mx-4 ${item === "•" ? "text-[#8b7355]" : "text-white/40"}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Featured products ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        <div className="flex items-baseline justify-between mb-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Selected pieces</p>
            <h2 className="font-display text-4xl md:text-5xl">Featured</h2>
          </div>
          <Link
            to="/shop"
            id="featured-view-all"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink border-b border-transparent hover:border-ink transition-all pb-0.5"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* ─── Divider ────────────────────────────────────────────────────── */}
      <hr className="seam-divider max-w-7xl mx-auto" />

      {/* ─── Category grid ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Browse by category</p>
          <h2 className="font-display text-4xl md:text-5xl">The edit</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              id={`category-${cat.label.toLowerCase()}`}
              className="group relative aspect-[3/4] overflow-hidden block"
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/55 mb-1">{cat.count}</p>
                <p className="font-display text-xl text-white">{cat.label}</p>
              </div>
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#c4a97e] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Brand statement (full-bleed dark) ──────────────────────────── */}
      <section className="relative bg-[#0a0905] text-white overflow-hidden">
        {/* Decorative vertical lines */}
        <div className="absolute inset-y-0 left-[12%] w-px bg-white/5 hidden md:block" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-white/5 hidden md:block" />
        <div className="absolute inset-y-0 right-[12%] w-px bg-white/5 hidden md:block" />

        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8b7355] mb-6">Our philosophy</p>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] mb-8">
                Made to last a decade, not a season.
              </h2>
              <p className="text-white/55 text-[1.05rem] leading-relaxed mb-10 max-w-md">
                SEAM works with a small set of mills and makers, chosen for their craft
                rather than their capacity. Every piece is reviewed before it ships.
                Nothing leaves that we wouldn't wear ourselves.
              </p>
              <Link
                to="/shop"
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-white border-b border-white/30 pb-1 hover:border-[#c4a97e] hover:text-[#c4a97e] transition-colors duration-300"
              >
                Explore the collection →
              </Link>
            </div>
            {/* Three pillars */}
            <div className="space-y-8">
              {[
                {
                  num: "01",
                  title: "Materials",
                  body: "Wool, cotton, silk and leather sourced from mills we've worked with for years. No shortcuts on fiber.",
                  accent: "#c4a97e",
                },
                {
                  num: "02",
                  title: "Construction",
                  body: "Small production runs, finished by hand where it matters. Seams that don't fail, buttons that stay put.",
                  accent: "#7a9e87",
                },
                {
                  num: "03",
                  title: "Longevity",
                  body: "Every piece ships with a care guide. The goal is decades, not seasons — wear it, mend it, keep it.",
                  accent: "#8b7355",
                },
              ].map((p) => (
                <div key={p.num} className="flex gap-6 group">
                  <span
                    className="font-mono text-[11px] text-white/20 pt-0.5 shrink-0 group-hover:text-white/50 transition-colors"
                    style={{ color: p.accent, opacity: 0.6 }}
                  >
                    {p.num}
                  </span>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 mb-1.5">{p.title}</p>
                    <p className="text-sm text-white/40 leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Newsletter strip ────────────────────────────────────────────── */}
      <section className="border-y border-ink/8">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-1">Stay in the loop</p>
            <p className="font-display text-2xl">New arrivals. Nothing else.</p>
          </div>
          <form
            id="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-0 w-full md:w-auto"
          >
            <input
              type="email"
              id="newsletter-email"
              placeholder="your@email.com"
              className="px-4 py-3 border border-ink/20 bg-transparent font-mono text-sm placeholder:text-ink/30 focus:outline-none focus:border-ink/60 w-full md:w-72"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-ink text-paper font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-oxblood transition-colors duration-300 shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
