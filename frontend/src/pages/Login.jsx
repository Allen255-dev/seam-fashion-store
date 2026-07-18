import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Sign in</h1>
      <p className="text-ink/60 mb-8 text-sm">Welcome back to SEAM.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 pr-16 text-sm focus:border-oxblood outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-ink/50 hover:text-oxblood"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-oxblood text-sm">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-ink text-paper py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6 text-center">
        New here?{" "}
        <Link to="/register" className="text-oxblood underline">
          Create an account
        </Link>
      </p>
      <p className="text-sm text-ink/60 mt-2 text-center">
        <Link to="/forgot-password" className="text-oxblood underline">
          Forgot your password?
        </Link>
      </p>
    </div>
  );
}
