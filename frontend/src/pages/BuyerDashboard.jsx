import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard.jsx";
import Loading from "../components/Loading.jsx";
import { getAllProperties, getLikedIds, likeProperty, unlikeProperty } from "../services/propertyApi.js";

export default function BuyerDashboard() {
  const [filters, setFilters] = useState({
    q: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    hideSold: true,
  });
  const [data, setData] = useState({ loading: true, error: "", props: [] });
  const [likedIds, setLikedIds] = useState(() => new Set());

  const params = useMemo(() => {
    const p = {};
    for (const [k, v] of Object.entries(filters)) {
      if (k === "hideSold") {
        if (v) p.hideSold = "true";
        continue;
      }
      if (String(v).trim() !== "") p[k] = v;
    }
    return p;
  }, [filters]);

  const loadLikes = useCallback(async () => {
    try {
      const { ids } = await getLikedIds();
      setLikedIds(new Set(ids || []));
    } catch {
      setLikedIds(new Set());
    }
  }, []);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  useEffect(() => {
    let alive = true;
    setData((d) => ({ ...d, loading: true, error: "" }));
    getAllProperties(params)
      .then((props) => {
        if (!alive) return;
        setData({ loading: false, error: "", props });
      })
      .catch((err) => {
        if (!alive) return;
        setData({ loading: false, error: err?.response?.data?.message || "Failed to load", props: [] });
      });
    return () => {
      alive = false;
    };
  }, [params]);

  async function toggleLike(propertyId) {
    const has = likedIds.has(propertyId);
    try {
      if (has) {
        await unlikeProperty(propertyId);
        setLikedIds((prev) => {
          const n = new Set(prev);
          n.delete(propertyId);
          return n;
        });
      } else {
        await likeProperty(propertyId);
        setLikedIds((prev) => new Set(prev).add(propertyId));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Buyer Dashboard</h2>
            <p className="mt-1 text-sm muted">
              Search and filter listings. ♥ saves to your{" "}
              <Link className="text-neon-cyan underline" to="/buyer/liked">
                Liked
              </Link>{" "}
              list.
            </p>
          </div>
          <div className="text-xs muted">Tip: toggle “Hide sold” to include sold listings.</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-400"
              checked={filters.hideSold}
              onChange={(e) => setFilters((f) => ({ ...f, hideSold: e.target.checked }))}
            />
            <span>Hide sold listings</span>
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <input
            className="input-neo md:col-span-2"
            placeholder="Search (title, description...)"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
          <input
            className="input-neo"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          />
          <input
            className="input-neo"
            placeholder="Min price"
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
          />
          <input
            className="input-neo"
            placeholder="Max price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <input
            className="input-neo md:col-span-1"
            placeholder="Bedrooms ≥"
            type="number"
            value={filters.bedrooms}
            onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value }))}
          />
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold transition hover:bg-slate-200 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10 md:col-span-1"
            onClick={() =>
              setFilters({
                q: "",
                location: "",
                minPrice: "",
                maxPrice: "",
                bedrooms: "",
                hideSold: true,
              })
            }
          >
            Clear
          </button>
          <div className="md:col-span-3 flex items-center justify-end text-sm muted">
            {data.loading ? "Updating results..." : `${data.props.length} result(s)`}
          </div>
        </div>
      </div>

      {data.loading ? (
        <Loading label="Loading properties..." />
      ) : data.error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
          {data.error}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.props.map((p) => (
            <PropertyCard
              key={p._id}
              p={p}
              likedIds={likedIds}
              showLike
              onToggleLike={toggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}
