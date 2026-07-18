import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <p className="font-display text-8xl mb-6 text-oxblood">404</p>
      <h1 className="font-display text-3xl mb-4">This page has been unpicked.</h1>
      <p className="text-ink/60 mb-10">
        Whatever you were looking for isn't here — the link may be broken or the page moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-ink text-paper px-8 py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors"
      >
        Back to the shop
      </Link>
    </div>
  );
}
