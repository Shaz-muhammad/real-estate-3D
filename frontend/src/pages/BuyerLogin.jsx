import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { buyerLogin } from "../services/authApi.js";
import { setAuth } from "../services/auth.js";

export default function BuyerLogin() {
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
      const data = await buyerLogin(form);
      setAuth(data);
      navigate(location.state?.from || "/buyer");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass rounded-3xl p-8 shadow-glow">
        <h2 className="text-2xl font-semibold">Buyer login</h2>
        <p className="mt-2 text-sm text-white/60">
          Browse listings, filter, and view 3D.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="input-neo"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="input-neo"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          <button
            className="btn-neon w-full justify-center text-black"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-sm text-black/60">
          New here?{" "}
          <Link className="text-neon-cyan hover:underline" to="/signup">
            Create an account
          </Link>
          . Seller?{" "}
          <Link
            className="text-neon-magenta hover:underline"
            to="/login/seller"
          >
            Seller login
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
