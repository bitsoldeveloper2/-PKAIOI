"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LATTICE_PALETTE } from "./scene-support";

/**
 * Neural lattice: ~1,400 nodes on a breathing dome, joined to their nearest
 * neighbours. Displacement is computed in the vertex shader from the same
 * function for points and lines so they always agree. Colours come from the
 * design tokens (jade + gold) and are passed in as uniforms.
 */

const COUNT = 1400;
const RADIUS = 2.25;
const NEIGHBOURS = 3;
const LINK_DISTANCE = 0.42;

const DISPLACE_GLSL = /* glsl */ `
  vec3 displace(vec3 p, float seed, float t) {
    float s = seed * 6.2831;
    return p + 0.055 * vec3(
      sin(t * 0.7 + s + p.y * 2.1),
      cos(t * 0.55 + s * 0.5 + p.x * 1.9),
      sin(t * 0.85 + s * 0.31 + p.z * 2.3)
    );
  }
`;

const POINT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aKind;
  varying float vKind;
  varying float vDepth;
  varying float vSeed;
  ${DISPLACE_GLSL}
  void main() {
    vec3 p = displace(position, aSeed, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = -mv.z;
    vKind = aKind;
    vSeed = aSeed;
    float base = aKind > 0.5 ? 7.5 : 3.0;
    gl_PointSize = base * uPixelRatio * (3.4 / vDepth);
  }
`;

const POINT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uJade;
  uniform vec3 uGold;
  varying float vKind;
  varying float vDepth;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.18, d);
    float fade = smoothstep(7.0, 3.0, vDepth);
    vec3 color = mix(uJade, uGold, vKind);
    if (vKind > 0.5) {
      alpha *= 0.55 + 0.45 * sin(uTime * 1.6 + vSeed * 12.0);
      alpha += smoothstep(0.5, 0.0, d) * 0.35;
    }
    gl_FragColor = vec4(color, alpha * fade * 0.95);
  }
`;

const LINE_VERT = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  varying float vDepth;
  ${DISPLACE_GLSL}
  void main() {
    vec3 p = displace(position, aSeed, uTime);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = -mv.z;
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform vec3 uJade;
  varying float vDepth;
  void main() {
    float fade = smoothstep(7.2, 3.2, vDepth);
    gl_FragColor = vec4(uJade, 0.22 * fade);
  }
`;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLattice() {
  const rand = mulberry32(20241001);
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  const kinds = new Float32Array(COUNT);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < COUNT; i++) {
    // Fibonacci sphere, biased toward the upper hemisphere to read as a dome.
    const y = 1 - (i / (COUNT - 1)) * 1.55;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const jitter = 0.94 + rand() * 0.12;
    positions[i * 3] = Math.cos(theta) * r * RADIUS * jitter;
    positions[i * 3 + 1] = y * RADIUS * jitter;
    positions[i * 3 + 2] = Math.sin(theta) * r * RADIUS * jitter;
    seeds[i] = rand();
    kinds[i] = rand() < 0.045 ? 1 : 0;
  }

  const segments: number[] = [];
  const segSeeds: number[] = [];
  const maxD2 = LINK_DISTANCE * LINK_DISTANCE;
  const nearest = new Array<{ j: number; d2: number }>(NEIGHBOURS);
  for (let i = 0; i < COUNT; i++) {
    nearest.fill({ j: -1, d2: Infinity });
    const ix = positions[i * 3]!, iy = positions[i * 3 + 1]!, iz = positions[i * 3 + 2]!;
    for (let j = 0; j < COUNT; j++) {
      if (i === j) continue;
      const dx = positions[j * 3]! - ix, dy = positions[j * 3 + 1]! - iy, dz = positions[j * 3 + 2]! - iz;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > maxD2) continue;
      for (let k = 0; k < NEIGHBOURS; k++) {
        if (d2 < nearest[k]!.d2) {
          nearest.splice(k, 0, { j, d2 });
          nearest.length = NEIGHBOURS;
          break;
        }
      }
    }
    for (const n of nearest) {
      if (n.j > i) {
        segments.push(ix, iy, iz, positions[n.j * 3]!, positions[n.j * 3 + 1]!, positions[n.j * 3 + 2]!);
        segSeeds.push(seeds[i]!, seeds[n.j]!);
      }
    }
  }

  return { positions, seeds, kinds, segments: new Float32Array(segments), segSeeds: new Float32Array(segSeeds) };
}

export type LatticeVariant = "hero" | "ambient";

/** Where the dome sits: beside the hero headline, or spread across the whole viewport. */
const PLACEMENT: Record<LatticeVariant, { position: [number, number, number]; scale: number; spin: number }> = {
  hero: { position: [2.35, -0.55, 0], scale: 1, spin: 1 },
  ambient: { position: [0.9, -0.3, 0], scale: 1.6, spin: 0.6 },
};

function Lattice({ jade, gold, animate, dark, variant }: { jade: string; gold: string; animate: boolean; dark: boolean; variant: LatticeVariant }) {
  const group = useRef<THREE.Group>(null);
  const pointMat = useRef<THREE.ShaderMaterial>(null);
  const lineMat = useRef<THREE.ShaderMaterial>(null);
  const { positions, seeds, kinds, segments, segSeeds } = useMemo(() => buildLattice(), []);
  const pixelRatio = useThree((s) => s.viewport.dpr);
  const target = useRef({ x: 0, y: 0 });
  const placement = PLACEMENT[variant];

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (pointMat.current) pointMat.current.uniforms.uTime!.value = animate ? t : 0;
    if (lineMat.current) lineMat.current.uniforms.uTime!.value = animate ? t : 0;
    if (!group.current) return;
    const g = group.current;
    const rx = 0.18 + target.current.y * 0.08;
    const ry = (animate ? t * 0.06 * placement.spin : 0) + target.current.x * 0.22;
    g.rotation.x += (rx - g.rotation.x) * Math.min(1, delta * 2.5);
    g.rotation.y += (ry - g.rotation.y) * Math.min(1, delta * 2.5);
  });

  const jadeColor = useMemo(() => new THREE.Color(jade), [jade]);
  const goldColor = useMemo(() => new THREE.Color(gold), [gold]);
  // Additive blending glows on dark surfaces but washes out on light ones.
  const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;

  return (
    <group ref={group} position={placement.position} scale={placement.scale}>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[segSeeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={lineMat}
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          transparent
          depthWrite={false}
          blending={blending}
          uniforms={{ uTime: { value: 0 }, uJade: { value: jadeColor } }}
        />
      </lineSegments>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          <bufferAttribute attach="attributes-aKind" args={[kinds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={pointMat}
          vertexShader={POINT_VERT}
          fragmentShader={POINT_FRAG}
          transparent
          depthWrite={false}
          blending={blending}
          uniforms={{
            uTime: { value: 0 },
            uPixelRatio: { value: pixelRatio },
            uJade: { value: jadeColor },
            uGold: { value: goldColor },
          }}
        />
      </points>
    </group>
  );
}

export default function LatticeCanvas({ animate = true, variant = "hero", dark = true }: { animate?: boolean; variant?: LatticeVariant; dark?: boolean }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const palette = LATTICE_PALETTE[dark ? "dark" : "light"];

  // Pause rendering when the scene scrolls out of view or the tab is hidden.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setActive(document.visibilityState === "visible" && (el.getBoundingClientRect().bottom > 0));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={active && animate ? "always" : "demand"}
        camera={{ position: [0, 0.35, 6.2], fov: 40, near: 0.1, far: 20 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power", stencil: false, depth: true }}
        style={{ background: "transparent" }}
      >
        <Lattice key={`${variant}-${dark ? "dark" : "light"}`} jade={palette.jade} gold={palette.gold} animate={animate} dark={dark} variant={variant} />
      </Canvas>
    </div>
  );
}
