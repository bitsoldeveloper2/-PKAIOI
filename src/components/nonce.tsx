"use client";

import { createContext, useContext } from "react";

const NonceContext = createContext<string | undefined>(undefined);

/** Exposes the per-request CSP nonce to client components that inject styles (e.g. CodeMirror). */
export function NonceProvider({ nonce, children }: { nonce?: string; children: React.ReactNode }) {
  return <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>;
}

export function useNonce() {
  return useContext(NonceContext);
}
