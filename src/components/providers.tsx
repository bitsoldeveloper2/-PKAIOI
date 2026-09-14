"use client";

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { NonceProvider } from "@/components/nonce";

export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    <NonceProvider nonce={nonce}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange nonce={nonce}>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </NonceProvider>
  );
}
