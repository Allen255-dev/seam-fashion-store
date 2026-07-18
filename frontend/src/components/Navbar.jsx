import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_LINKS = [
  { to: "/shop",                    label: "All" },
  { to: "/shop?category=outerwear", label: "Outerwear" },
  { to: "/shop?category=knitwear",  label: "Knitwear" },
  { to: "/shop?category=footwear",  label: "Footwear" },
  { to: "/shop?category=accessories",label: "Accessories" },
];

export default function Navbar() {
  const { itemCount, setIsDrawerOpen } = useCart();
  const { user, logout }       = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-paper/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(var(--color-ink)/0.08)]"
          : "bg-paper/95 backdrop-blur-md border-b border-ink/8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-[4.5rem]">

          {/* ── Logo ── */}
          <div className="flex items-center gap-5">
            {/* Hamburger — mobile only */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden flex flex-col gap-[5px] w-5 py-1"
            >
              <span className={`block h-px bg-ink transition-all duration-300 ${menuOpen ? "translate-y-[9px] rotate-45" : ""}`} />
              <span className={`block h-px bg-ink transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-px bg-ink transition-all duration-300 ${menuOpen ? "-translate-y-[9px] -rotate-45" : ""}`} />
            </button>

            <Link to="/" id="navbar-logo" className="font-display text-[1.6rem] leading-none tracking-tight">
              SEAM
            </Link>
          </div>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-7 font-mono text-[10px] uppercase tracking-[0.2em]">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                className={({ isActive }) =>
                  `relative py-1 transition-colors duration-200 ${
                    isActive
                      ? "text-ink after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-oxblood"
                      : "text-ink/45 hover:text-ink"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.2em]">

            {/* Dark mode toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="text-ink/45 hover:text-ink transition-colors duration-200 text-base leading-none"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? "○" : "●"}
            </button>

            {/* Auth links — desktop */}
            {user ? (
              <>
                <Link id="nav-orders" to="/orders"   className="hidden sm:inline text-ink/45 hover:text-ink transition-colors">Orders</Link>
                <Link id="nav-saved"  to="/wishlist" className="hidden sm:inline text-ink/45 hover:text-ink transition-colors">Saved</Link>
                {user.role === "admin" && (
                  <Link id="nav-admin" to="/admin" className="hidden sm:inline text-ink/45 hover:text-ink transition-colors">Admin</Link>
                )}
                <button
                  id="nav-signout"
                  onClick={logout}
                  className="hidden sm:inline text-ink/45 hover:text-ink transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link id="nav-signin" to="/login" className="hidden sm:inline text-ink/45 hover:text-ink transition-colors">
                Sign in
              </Link>
            )}

            {/* Cart */}
            <button 
              id="nav-cart" 
              onClick={() => setIsDrawerOpen(true)} 
              className="relative text-ink/70 hover:text-ink transition-colors"
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2.5 -right-3.5 bg-oxblood text-paper rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-body normal-case">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[500px] border-t border-ink/8" : "max-h-0"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5 font-mono text-[11px] uppercase tracking-[0.2em] bg-paper">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "text-ink" : "text-ink/45")}
            >
              {l.label}
            </NavLink>
          ))}
          <hr className="border-ink/8" />
          {user ? (
            <>
              <Link to="/orders"   onClick={() => setMenuOpen(false)} className="text-ink/60">Orders</Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="text-ink/60">Saved items</Link>
              <Link to="/account"  onClick={() => setMenuOpen(false)} className="text-ink/60">Account</Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-ink/60">Admin panel</Link>
              )}
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="text-left text-ink/60"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="text-ink/60">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-ink/60">Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
