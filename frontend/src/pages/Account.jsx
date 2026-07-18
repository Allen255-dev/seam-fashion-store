import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function Account() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const data = await api.post("/auth/change-password", { currentPassword, newPassword });
      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Account settings</h1>
      <p className="text-ink/60 mb-8 text-sm">
        Signed in as {user?.name} ({user?.email})
      </p>

      <h2 className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-4">
        Change password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            required
            type={showPasswords ? "text" : "password"}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 pr-16 text-sm focus:border-oxblood outline-none"
          />
        </div>
        <div className="relative">
          <input
            required
            type={showPasswords ? "text" : "password"}
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 pr-16 text-sm focus:border-oxblood outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-ink/50 hover:text-oxblood"
          >
            {showPasswords ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="text-oxblood text-sm">{error}</p>}
        {message && <p className="text-sage text-sm">{message}</p>}

        <button
          disabled={submitting}
          className="w-full bg-ink text-paper py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-50"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
