import React from "react";
import { Link } from "react-router-dom";

export default function PropertyCard({ p, likedIds, onToggleLike, showLike }) {
  const cover = p.images?.[0];
  const liked = likedIds?.has?.(p._id) || likedIds?.includes?.(p._id);
  const sold = p.status === "sold";

  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-glow transition hover:-translate-y-1 hover:shadow-glow2">
      {showLike ? (
        <button
          type="button"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-lg text-rose-500 shadow-md backdrop-blur transition hover:scale-110 dark:border-white/20 dark:bg-black/50 dark:text-rose-400"
          title={liked ? "Remove from liked" : "Add to liked"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleLike?.(p._id);
          }}
        >
          {liked ? "♥" : "♡"}
        </button>
      ) : null}

      <Link to={`/properties/${p._id}`} className="glass block overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200 dark:bg-black/40">
          {sold ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-lg font-bold uppercase tracking-wider text-white">
              Sold
            </div>
          ) : null}
          {cover ? (
            <img
              src={cover}
              alt={p.title}
              className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center muted">No image</div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold">{p.title}</div>
              <div className="text-sm muted">{p.location || "Location unknown"}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-100/80 px-3 py-1 text-sm dark:border-white/10 dark:bg-white/5">
              {p.details?.price ? `$${Number(p.details.price).toLocaleString()}` : "—"}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs muted">
            <span className="rounded-full border border-slate-200 bg-slate-100/80 px-2 py-1 dark:border-white/10 dark:bg-white/5">
              {p.details?.bedrooms || 0} bd
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100/80 px-2 py-1 dark:border-white/10 dark:bg-white/5">
              {p.details?.bathrooms || 0} ba
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100/80 px-2 py-1 dark:border-white/10 dark:bg-white/5">
              {p.details?.areaSqm || 0} m²
            </span>
            {p.model3dUrl ? (
              <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1 text-neon-cyan">
                3D
              </span>
            ) : null}
            {sold ? (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-amber-700 dark:text-amber-300">
                Sold out
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
}
