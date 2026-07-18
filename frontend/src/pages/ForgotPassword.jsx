import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const data = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Reset your password</h1>
      <p className="text-ink/60 mb-8 text-sm">
        Enter the email on your account and we'll send a reset link.
      </p>

      {message ? (
        <div className="border border-sage/40 bg-sage/10 p-4 text-sm">{message}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
          />
          {error && <p className="text-oxblood text-sm">{error}</p>}
          <button
            disabled={submitting}
            className="w-full bg-ink text-paper py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="text-sm text-ink/60 mt-6 text-center">
        <Link to="/login" className="text-oxblood underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
