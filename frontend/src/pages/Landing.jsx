import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="glass rounded-3xl p-8 shadow-glow">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-black/70">
          <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-glow" />
          Futuristic real estate marketplace
        </div>

        <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
          Explore properties with{" "}
          <span className="text-neon-cyan">interactive 3D</span>.
        </h1>
        <p className="mt-4 text-black/70">
          Sellers upload images and 3D models. Buyers browse, filter, and view
          listings in a sleek, dynamic interface built for modern property
          discovery.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-neon text-black" to="/buyer">
            Enter Buyer Dashboard
          </Link>
          <Link
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold hover:bg-white/10 transition"
            to="/seller"
          >
            Enter Seller Dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-black/90 font-semibold">For sellers</div>
            <div className="mt-1">
              Upload property photos + a 3D model file (.glb/.gltf/.usdz) to
              stand out.
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-black/90 font-semibold">For buyers</div>
            <div className="mt-1">
              Search and filter listings, then inspect with an interactive 3D
              viewer.
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-glow2">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-neon-magenta/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-neon-cyan/20 blur-3xl" />

        <div className="relative">
          <div className="text-sm text-black/70">Quick start</div>
          <div className="mt-3 grid gap-3">
            <Link
              className="glass rounded-2xl p-4 hover:shadow-glow transition"
              to="/signup"
            >
              <div className="text-black/90 font-semibold">
                Create an account
              </div>
              <div className="text-sm text-black/60">
                Choose buyer or seller role.
              </div>
            </Link>
            <Link
              className="glass rounded-2xl p-4 hover:shadow-glow transition"
              to="/login/buyer"
            >
              <div className="text-black/90 font-semibold">Buyer login</div>
              <div className="text-sm text-black/60">
                Browse and filter properties.
              </div>
            </Link>
            <Link
              className="glass rounded-2xl p-4 hover:shadow-glow transition"
              to="/login/seller"
            >
              <div className="text-black/90 font-semibold">Seller login</div>
              <div className="text-sm text-black/60">
                Upload images + 3D models.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
