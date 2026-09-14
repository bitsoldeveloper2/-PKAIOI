"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";

/** Catches WebGL/shader failures and swaps in the static fallback. */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export type SceneMode = "pending" | "canvas" | "static";
let detectedMode: SceneMode | null = null;

function getClientMode(): SceneMode {
  if (detectedMode) return detectedMode;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const lowPower = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
  detectedMode = !reduced && !narrow && !lowPower && supportsWebGL() ? "canvas" : "static";
  return detectedMode;
}

/**
 * Server renders nothing ("pending"); the client decides once whether WebGL is
 * appropriate. Reduced motion, phones, low-core devices and missing WebGL get
 * the static SVG instead.
 */
export function useSceneMode(): SceneMode {
  return useSyncExternalStore(
    () => () => {},
    getClientMode,
    (): SceneMode => "pending",
  );
}

export const LATTICE_PALETTE = {
  dark: { jade: "#3db48c", gold: "#d9b45c" },
  light: { jade: "#0f6e56", gold: "#b8892b" },
} as const;

/**
 * Static SVG lattice used when motion is reduced, WebGL is missing, or the scene fails.
 * `sparse` spreads fewer nodes over a larger area for full-screen use on phones.
 */
export function LatticeFallback({ dark = true, sparse = false, className = "absolute inset-0 size-full opacity-70" }: { dark?: boolean; sparse?: boolean; className?: string }) {
  const { jade, gold } = LATTICE_PALETTE[dark ? "dark" : "light"];
  const count = sparse ? 40 : 64;
  const links = sparse ? 2 : 3;
  const nodes = Array.from({ length: count }, (_, i) => {
    const a = i * 2.399963;
    const r = (sparse ? 12 : 8) + Math.sqrt(i) * (sparse ? 8 : 5.2);
    return { x: (sparse ? 78 : 60) + Math.cos(a) * r, y: (sparse ? 38 : 52) + Math.sin(a) * r * 0.62, big: i % 11 === 0 };
  });
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden preserveAspectRatio={sparse ? "xMidYMin slice" : "xMidYMid slice"}>
      <g stroke={jade} strokeOpacity={sparse ? 0.2 : 0.28} strokeWidth="0.25">
        {nodes.map((n, i) =>
          nodes.slice(i + 1, i + 1 + links).map((m, j) => <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} />),
        )}
      </g>
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.big ? 1.1 : 0.5} fill={n.big ? gold : jade} />
      ))}
    </svg>
  );
}
