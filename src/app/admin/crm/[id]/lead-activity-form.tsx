"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLeadActivityAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function LeadActivityForm({ leadId }: { leadId: string }) {
  const [pending, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  return (
    <form
      ref={form}
      className="rounded-xl border border-line bg-surface p-5"
      action={(fd) =>
        startTransition(async () => {
          try {
            await addLeadActivityAction(fd);
            form.current?.reset();
            toast({ title: "Activity logged", variant: "success" });
            router.refresh();
          } catch (err) {
            toast({ title: "Could not log activity", description: (err as Error).message, variant: "error" });
          }
        })
      }
    >
      <input type="hidden" name="leadId" value={leadId} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Log activity</h2>
        <Select name="type" defaultValue="NOTE" aria-label="Activity type" className="h-9 w-36">
          <option value="NOTE">Note</option>
          <option value="CALL">Call</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Meeting</option>
        </Select>
      </div>
      <label htmlFor="activity-body" className="sr-only">Details</label>
      <Textarea id="activity-body" name="body" rows={3} required maxLength={3000} placeholder="What happened, and what is the next step?" className="mt-3" />
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" loading={pending}>Add to timeline</Button>
      </div>
    </form>
  );
}
