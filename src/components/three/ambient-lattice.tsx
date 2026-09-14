"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { LatticeFallback, SceneBoundary, useSceneMode } from "./scene-support";

const LatticeCanvas = dynamic(() => import("./lattice"), { ssr: false, loading: () => null });

/**
 * Site-wide ambient layer: the hero's neural lattice, fixed behind every page
 * at low intensity. It sits at a negative z-index so it paints above the page
 * background and below all content; sections with their own background cover
 * it, which gives the pages rhythm. The palette follows the theme, pointer
 * events pass straight through, and the usual motion/WebGL/device checks
 * swap in the static SVG.
 */
export function AmbientLattice({ intensity = 1 }: { intensity?: number }) {
  const mode = useSceneMode();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  if (mode === "pending") return null;
  // The static SVG is denser per pixel than the WebGL dome, so it runs much quieter.
  const base = mode === "static" ? (dark ? 0.4 : 0.3) : dark ? 0.7 : 0.55;
  const opacity = Math.max(0, Math.min(1, base * intensity));

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden" style={{ opacity }}>
      {mode === "static" ? (
        <LatticeFallback dark={dark} sparse className="absolute inset-0 size-full opacity-60" />
      ) : (
        <SceneBoundary fallback={<LatticeFallback dark={dark} sparse className="absolute inset-0 size-full opacity-60" />}>
          <LatticeCanvas variant="ambient" dark={dark} />
        </SceneBoundary>
      )}
    </div>
  );
}
