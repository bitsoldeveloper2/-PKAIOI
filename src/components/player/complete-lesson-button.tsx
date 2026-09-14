"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Award, CheckCircle2 } from "lucide-react";
import { completeLessonAction, type LessonActionState } from "@/server/actions/campus";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function CompleteLessonButton({ lessonId, completed, nextHref }: { lessonId: string; completed: boolean; nextHref: Route | null }) {
  const [state, action, pending] = useActionState<LessonActionState | undefined, FormData>(completeLessonAction, undefined);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast({ title: state.certificateCode ? "Course complete — certificate issued" : "Lesson complete", description: state.certificateCode ? "Find it under Certificates." : undefined, variant: "success" });
      router.refresh();
    } else if (state.message) {
      toast({ title: "Could not save progress", description: state.message, variant: "error" });
    }
  }, [state, router, toast]);

  if (completed || state?.ok) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 className="size-4" aria-hidden />Completed</span>
        {state?.certificateCode ? <ButtonLink href="/campus/certificates" size="sm" variant="outline"><Award className="size-4" aria-hidden />View certificate</ButtonLink> : null}
        {nextHref ? <ButtonLink href={nextHref} size="sm">Next lesson</ButtonLink> : null}
      </div>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="lessonId" value={lessonId} />
      <Button type="submit" loading={pending}><CheckCircle2 className="size-4" aria-hidden />Mark as complete</Button>
    </form>
  );
}
