import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard.jsx";
import Loading from "../components/Loading.jsx";
import { getLikedProperties, likeProperty, unlikeProperty } from "../services/propertyApi.js";

export default function BuyerLiked() {
  const [state, setState] = useState({ loading: true, error: "", props: [] });
  const [likedIds, setLikedIds] = useState(() => new Set());

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const props = await getLikedProperties();
      setLikedIds(new Set((props || []).map((p) => p._id)));
      setState({ loading: false, error: "", props: props || [] });
    } catch (e) {
      setState({ loading: false, error: e?.response?.data?.message || "Failed to load", props: [] });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
        setState((s) => ({ ...s, props: s.props.filter((p) => p._id !== propertyId) }));
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Liked properties</h2>
            <p className="mt-1 text-sm muted">Properties you saved with ♥</p>
          </div>
          <Link className="text-sm text-neon-cyan hover:underline" to="/buyer">
            ← Back to browse
          </Link>
        </div>
      </div>

      {state.loading ? (
        <Loading label="Loading liked..." />
      ) : state.error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
          {state.error}
        </div>
      ) : state.props.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center muted">No liked properties yet. Browse and tap ♡ on a card.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.props.map((p) => (
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
