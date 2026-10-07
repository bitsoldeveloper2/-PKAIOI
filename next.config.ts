import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Baseline security headers. The Content-Security-Policy is set per request in
 * `src/proxy.ts` because it carries a nonce; everything that is static lives here.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const immutableCache = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  reactCompiler: true,
  typedRoutes: true,
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "@node-rs/argon2"],
  // Hosting builders are small containers: skip source maps and cap the static-generation
  // workers (the default is one per host CPU, which a container cannot afford). The
  // build itself runs through scripts/build.mjs, which fits the Node heap to the container.
  productionBrowserSourceMaps: false,
  enablePrerenderSourceMaps: false,
  experimental: {
    authInterrupts: true,
    taint: true,
    optimizePackageImports: ["lucide-react", "date-fns", "motion"],
    serverSourceMaps: false,
    cpus: 2,
    // Used only when building with `--webpack`: trades a little speed for much less memory.
    webpackMemoryOptimizations: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80, 90],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/_next/static/(.*)", headers: immutableCache },
      { source: "/pyodide/(.*)", headers: immutableCache },
      { source: "/fonts/(.*)", headers: immutableCache },
    ];
  },
};

export default nextConfig;
