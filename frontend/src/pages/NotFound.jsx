import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="glass rounded-3xl p-10 shadow-glow">
        <div className="text-5xl font-semibold text-neon-cyan">404</div>
        <div className="mt-3 text-white/70">This page drifted into deep space.</div>
        <div className="mt-6 flex justify-center gap-3">
          <Link className="btn-neon text-black" to="/">
            Go home
          </Link>
          <Link className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold hover:bg-white/10 transition" to="/buyer">
            Browse
          </Link>
        </div>
      </div>
    </div>
  );
}

