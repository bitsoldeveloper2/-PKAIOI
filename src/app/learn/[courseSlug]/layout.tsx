import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getCurriculumForLearner } from "@/server/queries/campus";
import { PlayerShell } from "./player-shell";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Focused learning layout: no campus sidebar, just the course's curriculum,
 * the lesson, and the tutor. Enrolment is checked per lesson so preview
 * lessons stay reachable for prospective learners who are signed in.
 */
export default async function LearnLayout({ children, params }: { children: React.ReactNode; params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const user = await requirePermission("campus:access", `/learn/${courseSlug}`);
  const curriculum = await getCurriculumForLearner(user.id, courseSlug);
  if (!curriculum) notFound();

  return (
    <PlayerShell
      course={curriculum.course}
      modules={curriculum.modules}
      progressPct={curriculum.progressPct}
      completedLessons={curriculum.completedLessons}
      totalLessons={curriculum.totalLessons}
      enrolled={Boolean(curriculum.enrollment)}
      user={{ name: user.name, avatarUrl: user.avatarUrl }}
    >
      {children}
    </PlayerShell>
  );
}
