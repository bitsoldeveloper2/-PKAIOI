import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Lock } from "lucide-react";
import { requireUser } from "@/server/auth/dal";
import { getLessonForLearner } from "@/server/queries/campus";
import { aiEnabled } from "@/lib/env";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { VideoPlayer } from "@/components/player/video-player";
import { QuizForm } from "@/components/player/quiz-form";
import { LabWorkbench } from "@/components/player/lab-workbench";
import { CompleteLessonButton } from "@/components/player/complete-lesson-button";
import { LessonSidePanel } from "@/components/player/lesson-side-panel";

const TYPE_LABEL = { VIDEO: "Lecture", ARTICLE: "Reading", QUIZ: "Quiz", LAB: "Lab" } as const;

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string; lessonId: string }> }): Promise<Metadata> {
  const { courseSlug, lessonId } = await params;
  const user = await requireUser(`/learn/${courseSlug}/${lessonId}`);
  const data = await getLessonForLearner(user.id, courseSlug, lessonId);
  return { title: data ? `${data.lesson.title} · ${data.curriculum.course.title}` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonId: string }> }) {
  const { courseSlug, lessonId } = await params;
  const user = await requireUser(`/learn/${courseSlug}/${lessonId}`);
  const data = await getLessonForLearner(user.id, courseSlug, lessonId);
  if (!data) notFound();

  const { lesson, curriculum, moduleTitle, position, prev, next, completed, note, attempts, lastLab } = data;
  const enrolled = Boolean(curriculum.enrollment);
  const accessible = enrolled || lesson.isPreview;
  const prevHref = prev ? (`/learn/${courseSlug}/${prev.id}` as Route) : null;
  const nextHref = next ? (`/learn/${courseSlug}/${next.id}` as Route) : null;

  const suggestions =
    lesson.type === "LAB"
      ? ["Give me a hint for the first failing test", "Explain the brief in simpler terms", "What is the idea behind this exercise?"]
      : lesson.type === "QUIZ"
        ? ["Help me revise the ideas this quiz covers", "Why does validation matter so much?"]
        : ["Explain the key idea in this lesson with an example", "Quiz me on this lesson", "What should I remember from this?"];

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <article className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-muted">
            <Badge tone="neutral">{TYPE_LABEL[lesson.type]}</Badge>
            <span>{moduleTitle}</span>
            <span aria-hidden>·</span>
            <span className="tabular">Lesson {position.index} of {position.total}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 tabular"><Clock className="size-3.5" aria-hidden />{lesson.durationMinutes} min</span>
            {completed ? <Badge tone="success"><CheckCircle2 className="size-3" aria-hidden />Completed</Badge> : null}
          </div>
          <h1 className="mt-4 font-display text-display-md text-ink">{lesson.title}</h1>
        </header>

        {!accessible ? (
          <div className="mt-10 max-w-xl rounded-xl border border-line bg-surface p-6">
            <Lock className="size-6 text-ink-subtle" aria-hidden />
            <h2 className="mt-3 font-display text-xl text-ink">Enrol to open this lesson</h2>
            <p className="mt-2 text-sm text-ink-muted">Preview lessons are open to everyone with an account. The rest of the course unlocks when you enrol — it is free for campus members.</p>
            <ButtonLink href={`/courses/${courseSlug}` as Route} className="mt-4">Go to the course page</ButtonLink>
          </div>
        ) : (
          <div className="mt-8 max-w-3xl space-y-10">
            {lesson.type === "VIDEO" && lesson.videoUrl ? (
              <VideoPlayer src={lesson.videoUrl} title={lesson.title} lessonId={lesson.id} completed={completed} />
            ) : null}

            {lesson.type === "QUIZ" ? (
              <>
                <Markdown content={lesson.content} />
                <QuizForm lessonId={lesson.id} questions={lesson.quiz} attempts={attempts} nextHref={nextHref} />
              </>
            ) : lesson.type === "LAB" && lesson.lab ? (
              <>
                <Markdown content={lesson.content} />
                <LabWorkbench lessonId={lesson.id} lab={lesson.lab} lastSubmission={lastLab} aiEnabled={aiEnabled} brief={lesson.content} nextHref={nextHref} />
              </>
            ) : (
              <Markdown content={lesson.content} />
            )}

            {lesson.type === "VIDEO" || lesson.type === "ARTICLE" ? (
              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
                <CompleteLessonButton lessonId={lesson.id} completed={completed} nextHref={nextHref} />
                <p className="text-sm text-ink-muted">{completed ? "You can revisit this lesson any time." : "Mark it complete when you have finished."}</p>
              </div>
            ) : null}

            <nav aria-label="Lesson navigation" className="flex items-stretch justify-between gap-3 border-t border-line pt-6">
              {prevHref && prev ? (
                <Link href={prevHref} className="group flex max-w-[48%] items-center gap-3 rounded-lg border border-line px-4 py-3 text-left transition-colors hover:bg-surface-2">
                  <ArrowLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                  <span className="min-w-0"><span className="block text-[0.6875rem] uppercase tracking-wider text-ink-subtle">Previous</span><span className="block truncate text-sm text-ink">{prev.title}</span></span>
                </Link>
              ) : <span />}
              {nextHref && next ? (
                <Link href={nextHref} className="group flex max-w-[48%] items-center gap-3 rounded-lg border border-line px-4 py-3 text-right transition-colors hover:bg-surface-2">
                  <span className="min-w-0"><span className="block text-[0.6875rem] uppercase tracking-wider text-ink-subtle">Next</span><span className="block truncate text-sm text-ink">{next.title}</span></span>
                  <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                </Link>
              ) : (
                <Link href="/campus/certificates" className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-right transition-colors hover:bg-surface-2">
                  <span><span className="block text-[0.6875rem] uppercase tracking-wider text-ink-subtle">End of course</span><span className="block text-sm text-ink">View certificates</span></span>
                  <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                </Link>
              )}
            </nav>
          </div>
        )}
      </article>

      {accessible ? (
        <LessonSidePanel
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          courseId={curriculum.course.id}
          courseTitle={curriculum.course.title}
          note={note}
          suggestions={suggestions}
          userName={user.name}
          aiEnabled={aiEnabled}
          isLab={lesson.type === "LAB"}
        />
      ) : null}
    </div>
  );
}
