import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Create an account</h1>
      <p className="text-ink/60 mb-8 text-sm">Track orders and check out faster next time.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
        />
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
            placeholder="Password (min. 8 characters)"
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-oxblood underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
