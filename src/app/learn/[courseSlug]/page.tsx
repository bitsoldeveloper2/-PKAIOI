import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/dal";
import { getCurriculumForLearner } from "@/server/queries/campus";

/** `/learn/[course]` opens the learner's next lesson. */
export default async function LearnIndexPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const user = await requireUser(`/learn/${courseSlug}`);
  const curriculum = await getCurriculumForLearner(user.id, courseSlug);
  if (!curriculum) notFound();
  if (!curriculum.nextLessonId) redirect(`/courses/${courseSlug}` as Route);
  redirect(`/learn/${courseSlug}/${curriculum.nextLessonId}` as Route);
}
