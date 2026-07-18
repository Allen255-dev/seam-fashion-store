import { Link } from "react-router-dom";

const COLS = [
  {
    heading: "Shop",
    links: [
      { label: "All products",  to: "/shop" },
      { label: "Outerwear",     to: "/shop?category=outerwear" },
      { label: "Knitwear",      to: "/shop?category=knitwear" },
      { label: "Footwear",      to: "/shop?category=footwear" },
      { label: "Accessories",   to: "/shop?category=accessories" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & returns", to: "/" },
      { label: "Size guide",         to: "/" },
      { label: "Care instructions",  to: "/" },
      { label: "Contact",            to: "/" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About SEAM",  to: "/" },
      { label: "Materials",   to: "/" },
      { label: "Makers",      to: "/" },
      { label: "Stockists",   to: "/" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/8 bg-paper">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 pr-8">
            <p className="font-display text-2xl mb-4">SEAM</p>
            <p className="text-sm text-ink/50 leading-relaxed max-w-[220px]">
              Considered clothing, cut to last. Small runs, real materials, no filler.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink/35 mb-4">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-ink/55 hover:text-ink transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-ink/8 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink/30">
            © {year} SEAM — All rights reserved
          </p>
          <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/30">
            <span>Privacy policy</span>
            <span>Terms of use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
