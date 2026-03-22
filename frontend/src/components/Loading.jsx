import React from "react";

export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 muted">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-neon-cyan dark:border-white/30" />
      <div className="text-sm">{label}</div>
    </div>
  );
}

