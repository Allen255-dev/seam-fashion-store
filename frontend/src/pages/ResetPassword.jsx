import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { email, token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Invalid reset link</h1>
        <p className="text-ink/60 mb-6">
          This link is missing information. Request a new one from the sign-in page.
        </p>
        <Link to="/forgot-password" className="text-oxblood underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-display text-3xl mb-2">Choose a new password</h1>
      <p className="text-ink/60 mb-8 text-sm">Resetting password for {email}</p>

      {success ? (
        <div className="border border-sage/40 bg-sage/10 p-4 text-sm">
          Password updated — redirecting you to sign in…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="password"
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-oxblood outline-none"
          />
          {error && <p className="text-oxblood text-sm">{error}</p>}
          <button
            disabled={submitting}
            className="w-full bg-ink text-paper py-4 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-50"
          >
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
