import { cn } from "@/lib/utils";

/** Inline result banner for server-action forms. */
export function FormStatus({ state, className }: { state?: { ok?: boolean; message?: string } | null; className?: string }) {
  if (!state?.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={cn("rounded-md px-3.5 py-2.5 text-sm", state.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger", className)}>
      {state.message}
    </p>
  );
}
