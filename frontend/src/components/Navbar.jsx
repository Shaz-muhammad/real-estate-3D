import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuth } from "../services/auth.js";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm transition ${
          isActive
            ? "bg-slate-200/90 shadow-md dark:bg-white/10 dark:shadow-glow"
            : "hover:bg-slate-200/60 dark:hover:bg-white/5"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar({ theme, setTheme, auth }) {
  const navigate = useNavigate();
  const role = auth?.user?.role || "";

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta shadow-glow transition group-hover:shadow-glow2" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">NeonEstate</div>
            <div className="text-[11px] muted">Real estate, re-imagined</div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/buyer">Buyer</NavItem>
          <NavItem to="/seller">Seller</NavItem>
          {role === "buyer" ? <NavItem to="/buyer/liked">Liked</NavItem> : null}
          {role === "admin" ? <NavItem to="/admin">Admin</NavItem> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-200 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {!auth?.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                className="rounded-xl px-3 py-2 text-sm hover:bg-slate-200/70 dark:hover:bg-white/5"
                to="/signup"
              >
                Sign up
              </Link>
              <Link className="btn-neon text-black" to="/login/buyer">
                Login
              </Link>
              <Link
                className="hidden rounded-xl border border-slate-300 px-2 py-2 text-xs text-slate-600 sm:inline dark:border-white/20 dark:text-white/70"
                to="/login/admin"
              >
                Admin
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden text-sm muted sm:block">
                {auth.user.name} <span className="text-slate-400 dark:text-white/40">({role})</span>
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5"
                onClick={() => {
                  clearAuth();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
