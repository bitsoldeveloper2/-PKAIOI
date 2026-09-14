import type { Metadata } from "next";
import { requireUser } from "@/server/auth/dal";
import { db } from "@/server/db";
import { aiEnabled } from "@/lib/env";
import { PageHeader } from "@/components/ui/section-heading";
import { LabPlayground } from "./lab-playground";

export const metadata: Metadata = { title: "Coding lab" };

export default async function LabPage() {
  const user = await requireUser("/campus/lab");
  const recent = await db.labSubmission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, language: true, passed: true, createdAt: true, lesson: { select: { id: true, title: true, module: { select: { course: { select: { slug: true, title: true } } } } } } },
  });

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader
        eyebrow="AI on campus"
        title="Coding lab"
        lede="A scratchpad for Python and JavaScript that runs entirely in your browser. Ask the AI reviewer when you want a second pair of eyes."
      />
      <div className="mt-8">
        <LabPlayground
          aiEnabled={aiEnabled}
          recent={recent.map((r) => ({
            id: r.id,
            language: r.language,
            passed: r.passed,
            createdAt: r.createdAt.toISOString(),
            lessonTitle: r.lesson.title,
            href: `/learn/${r.lesson.module.course.slug}/${r.lesson.id}`,
            courseTitle: r.lesson.module.course.title,
          }))}
        />
      </div>
    </div>
  );
}
