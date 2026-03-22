import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authApi.js";
import { setAuth } from "../services/auth.js";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(form);
      setAuth(data);
      navigate(data.user.role === "seller" ? "/seller" : "/buyer");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass rounded-3xl p-8 shadow-glow">
        <h2 className="text-2xl font-semibold">Create your account</h2>
        <p className="mt-2 text-sm text-white/60">Choose a role. You can login via dedicated buyer/seller pages.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="input-neo"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
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
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                form.role === "buyer"
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setForm((f) => ({ ...f, role: "buyer" }))}
            >
              Buyer
            </button>
            <button
              type="button"
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                form.role === "seller"
                  ? "border-neon-magenta/50 bg-neon-magenta/10 text-neon-magenta shadow-glow2"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setForm((f) => ({ ...f, role: "seller" }))}
            >
              Seller
            </button>
          </div>

          <button className="btn-neon w-full justify-center text-black" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-white/60">
          Already have an account?{" "}
          <Link className="text-neon-cyan hover:underline" to="/login/buyer">
            Buyer login
          </Link>{" "}
          or{" "}
          <Link className="text-neon-magenta hover:underline" to="/login/seller">
            Seller login
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

