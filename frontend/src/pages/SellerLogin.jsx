import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sellerLogin } from "../services/authApi.js";
import { setAuth } from "../services/auth.js";

export default function SellerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await sellerLogin(form);
      setAuth(data);
      navigate(location.state?.from || "/seller");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="glass rounded-3xl p-8 shadow-glow2 bg-white/10 dark:bg-black/20 text-black dark:text-white transition-colors duration-300">
        <h2 className="text-2xl font-semibold text-black dark:text-white">
          Seller login
        </h2>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          Upload images + 3D models to captivate buyers.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="input-neo bg-white/90 dark:bg-black/80 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 border border-black/20 dark:border-white/20"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="input-neo bg-white/90 dark:bg-black/80 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 border border-black/20 dark:border-white/20"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          <button
            className="btn-neon w-full justify-center text-black dark:text-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-sm text-black/60 dark:text-white/60">
          New here?{" "}
          <Link className="text-neon-cyan hover:underline" to="/signup">
            Create an account
          </Link>
          . Buyer?{" "}
          <Link className="text-neon-magenta hover:underline" to="/login/buyer">
            Buyer login
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
