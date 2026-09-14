"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserDisabledAction, updateUserRoleAction } from "@/server/actions/admin";
import { ROLE_LABELS, ROLES } from "@/server/auth/permissions";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function UserActions({ userId, role, disabled, isSelf }: { userId: string; role: string; disabled: boolean; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const run = (fn: () => Promise<void>, success: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast({ title: success, variant: "success" });
        router.refresh();
      } catch (err) {
        toast({ title: "Not allowed", description: (err as Error).message, variant: "error" });
      }
    });

  return (
    <div className="inline-flex items-center gap-2" aria-busy={pending}>
      <Select
        aria-label="Role"
        defaultValue={role}
        disabled={isSelf || pending}
        className="h-8 w-36 text-xs"
        onChange={(e) => {
          const fd = new FormData();
          fd.set("userId", userId);
          fd.set("role", e.target.value);
          run(() => updateUserRoleAction(fd), "Role updated");
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </Select>
      <Button
        size="sm"
        variant={disabled ? "outline" : "ghost"}
        disabled={isSelf || pending}
        onClick={() => {
          if (!disabled && !confirm("Disable this account? Their sessions end immediately.")) return;
          const fd = new FormData();
          fd.set("userId", userId);
          fd.set("disabled", String(!disabled));
          run(() => setUserDisabledAction(fd), disabled ? "Account enabled" : "Account disabled");
        }}
        className={disabled ? "" : "text-danger"}
      >
        {disabled ? "Enable" : "Disable"}
      </Button>
    </div>
  );
}
