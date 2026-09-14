"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { setCourseGovernanceAction } from "@/server/actions/content";
import { Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function CourseGovernance({ courseId, featured, instructorId, instructors }: { courseId: string; featured: boolean; instructorId: string; instructors: { id: string; name: string }[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const submit = (next: { featured?: boolean; instructorId?: string }) => {
    const fd = new FormData();
    fd.set("courseId", courseId);
    fd.set("featured", String(next.featured ?? featured));
    fd.set("instructorId", next.instructorId ?? instructorId);
    startTransition(async () => {
      try {
        await setCourseGovernanceAction(fd);
        toast({ title: "Course updated", variant: "success" });
        router.refresh();
      } catch (err) {
        toast({ title: "Could not update", description: (err as Error).message, variant: "error" });
      }
    });
  };

  return (
    <div className="flex items-center gap-2" aria-busy={pending}>
      <button
        type="button"
        onClick={() => submit({ featured: !featured })}
        aria-pressed={featured}
        aria-label={featured ? "Remove from featured" : "Feature this course"}
        className={cn("grid size-8 place-items-center rounded-md border transition-colors", featured ? "border-gold bg-gold-soft text-gold" : "border-line text-ink-subtle hover:text-ink")}
      >
        <Star className="size-4" aria-hidden fill={featured ? "currentColor" : "none"} />
      </button>
      <Select aria-label="Instructor" defaultValue={instructorId} className="h-8 w-44 text-xs" onChange={(e) => submit({ instructorId: e.target.value })}>
        {instructors.map((i) => (
          <option key={i.id} value={i.id}>{i.name}</option>
        ))}
      </Select>
    </div>
  );
}
