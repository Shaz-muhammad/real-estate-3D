import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stage, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const gltf = useGLTF(url, true);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  return <primitive object={scene} />;
}

export default function ModelViewer({ url, fileType }) {
  const type = (fileType || "").toLowerCase();

  if (!url) {
    return (
      <div className="glass flex h-[360px] items-center justify-center rounded-2xl muted">
        No 3D model uploaded
      </div>
    );
  }

  if (type === "usdz") {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="text-sm muted">
          USDZ is uploaded; in-browser preview uses <span className="font-semibold text-slate-900 dark:text-white">GLB/GLTF</span>.
        </div>
        <a
          className="mt-3 inline-flex rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm transition hover:bg-slate-200 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          Download USDZ
        </a>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <div className="text-sm muted">Interactive 3D Preview</div>
        <div className="text-xs muted">Drag to rotate • Scroll to zoom</div>
      </div>
      <div className="h-[420px]">
        <Canvas camera={{ position: [2.2, 1.4, 2.2], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <Suspense fallback={null}>
            <Stage intensity={0.9} environment="city" adjustCamera={1.1}>
              <Model url={url} />
            </Stage>
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enableDamping makeDefault />
        </Canvas>
      </div>
    </div>
  );
}

// Intentionally not preloading a placeholder model.

