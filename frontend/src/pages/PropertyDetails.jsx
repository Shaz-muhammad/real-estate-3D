import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import ModelViewer from "../components/ModelViewer.jsx";
import { getPropertyById, getLikedIds, likeProperty, unlikeProperty } from "../services/propertyApi.js";
import { getAuth } from "../services/auth.js";

export default function PropertyDetails() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: "", p: null });
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    let alive = true;
    setState({ loading: true, error: "", p: null });
    getPropertyById(id)
      .then((p) => {
        if (!alive) return;
        setState({ loading: false, error: "", p });
        setImgIdx(0);
      })
      .catch((err) => {
        if (!alive) return;
        setState({ loading: false, error: err?.response?.data?.message || "Failed to load", p: null });
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (auth.user?.role !== "buyer" || !id) return;
    getLikedIds()
      .then(({ ids }) => setLiked((ids || []).includes(id)))
      .catch(() => setLiked(false));
  }, [auth.user?.role, id]);

  async function toggleLike() {
    if (auth.user?.role !== "buyer") return;
    try {
      if (liked) {
        await unlikeProperty(id);
        setLiked(false);
      } else {
        await likeProperty(id);
        setLiked(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const images = useMemo(() => state.p?.images || [], [state.p]);
  const cover = images[imgIdx] || images[0] || "";

  if (state.loading) return <Loading label="Loading property..." />;
  if (state.error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
          {state.error}
        </div>
        <Link className="text-neon-cyan hover:underline" to="/buyer">
          Back to browse
        </Link>
      </div>
    );
  }

  const p = state.p;
  const seller = p.sellerId;
  const contactHref = seller?.email ? `mailto:${seller.email}?subject=${encodeURIComponent(`Inquiry: ${p.title}`)}` : "";
  const sold = p.status === "sold";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="text-sm muted hover:underline" to="/buyer">
          ← Back to results
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {auth.user?.role === "buyer" ? (
            <button
              type="button"
              onClick={toggleLike}
              className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold dark:border-white/15 dark:bg-white/10"
            >
              {liked ? "♥ Liked" : "♡ Like"}
            </button>
          ) : null}
          {seller?.email ? (
            <a className="btn-neon text-black" href={contactHref}>
              Contact seller
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="glass overflow-hidden rounded-2xl shadow-glow">
            <div className="relative aspect-[16/10] bg-slate-200 dark:bg-black/40">
              {sold ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 text-xl font-bold uppercase tracking-widest text-white">
                  Sold out
                </div>
              ) : null}
              {cover ? (
                <img src={cover} alt={p.title} className="h-full w-full object-cover opacity-95" />
              ) : (
                <div className="flex h-full items-center justify-center muted">No image</div>
              )}
            </div>
          </div>

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 8).map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImgIdx(idx)}
                  className={`overflow-hidden rounded-xl border transition ${
                    idx === imgIdx
                      ? "border-neon-cyan/60 shadow-glow"
                      : "border-slate-200 dark:border-white/10 dark:hover:border-white/20"
                  }`}
                >
                  <img src={src} alt={`thumb-${idx}`} className="h-20 w-full object-cover opacity-90" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-3xl p-6 shadow-glow2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{p.title}</h2>
                <div className="mt-1 text-sm muted">{p.location || "Location unknown"}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs muted">Price</div>
                <div className="text-lg font-semibold text-neon-cyan">
                  {p.details?.price ? `$${Number(p.details.price).toLocaleString()}` : "—"}
                </div>
              </div>
            </div>

            {p.description ? <p className="mt-4 text-sm muted">{p.description}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2 text-xs muted">
              <span className="rounded-full border border-slate-200 bg-slate-100/80 px-2 py-1 dark:border-white/10 dark:bg-white/5">
                {p.details?.bedrooms || 0} bd
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-100/80 px-2 py-1 dark:border-white/10 dark:bg-white/5">
                {p.details?.bathrooms || 0} ba
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-100/80 px-2 py-1 dark:border-white/10 dark:bg-white/5">
                {p.details?.areaSqm || 0} m²
              </span>
              {sold ? (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-amber-800 dark:text-amber-200">
                  Sold out
                </span>
              ) : (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-emerald-800 dark:text-emerald-200">
                  Available
                </span>
              )}
              {p.model3dUrl ? (
                <span className="rounded-full border border-neon-magenta/30 bg-neon-magenta/10 px-2 py-1 text-neon-magenta">
                  3D attached
                </span>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-white/5">
              <div className="font-semibold">Seller</div>
              <div className="mt-1 muted">
                {seller?.name || "Unknown"} {seller?.email ? `• ${seller.email}` : ""}
              </div>
              {seller?.email ? (
                <div className="mt-3">
                  <a
                    className="inline-block rounded-xl border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-200 dark:border-white/15 dark:hover:bg-white/10"
                    href={contactHref}
                  >
                    Email seller
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          <ModelViewer url={p.model3dUrl} fileType={p.model3dType} />
        </div>
      </div>
    </div>
  );
}
