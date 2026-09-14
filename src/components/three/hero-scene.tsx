"use client";

import dynamic from "next/dynamic";
import { LatticeFallback, SceneBoundary, useSceneMode } from "./scene-support";

const LatticeCanvas = dynamic(() => import("./lattice"), { ssr: false, loading: () => null });

export { LatticeFallback } from "./scene-support";

/** The home hero's lattice: always on the dark hero, positioned beside the headline. */
export function HeroScene() {
  const mode = useSceneMode();
  if (mode === "pending") return null;
  if (mode === "static") return <LatticeFallback />;
  return (
    <SceneBoundary fallback={<LatticeFallback />}>
      <LatticeCanvas variant="hero" dark />
    </SceneBoundary>
  );
}
