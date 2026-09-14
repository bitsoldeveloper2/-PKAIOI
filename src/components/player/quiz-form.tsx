"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { submitQuizAction, type LessonActionState } from "@/server/actions/campus";
import type { QuizQuestionPublic } from "@/server/queries/campus";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Attempt = { id: string; score: number; maxScore: number; createdAt: Date };

export function QuizForm({ lessonId, questions, attempts, nextHref }: { lessonId: string; questions: QuizQuestionPublic[]; attempts: Attempt[]; nextHref: Route | null }) {
  const [state, action, pending] = useActionState<LessonActionState | undefined, FormData>(submitQuizAction, undefined);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [key, setKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const results = state?.ok ? new Map(state.results?.map((r) => [r.id, r])) : null;
  const passed = state?.ok && state.score !== undefined && state.maxScore ? state.score / state.maxScore >= 0.7 : false;
  const best = attempts.reduce<Attempt | null>((b, a) => (!b || a.score / a.maxScore > b.score / b.maxScore ? a : b), null);

  const retake = () => {
    setAnswers({});
    setKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {best ? (
        <p className="text-sm text-ink-muted">
          Best score so far: <span className="font-semibold tabular text-ink">{best.score}/{best.maxScore}</span> on {formatDate(best.createdAt)}. Only your best counts.
        </p>
      ) : null}

      {state?.ok && state.score !== undefined ? (
        <div role="status" className={cn("rounded-xl border p-5", passed ? "border-success/30 bg-success-soft" : "border-warning/40 bg-warning-soft")}>
          <div className="flex items-start gap-3">
            {passed ? <CheckCircle2 className="mt-0.5 size-5 text-success" aria-hidden /> : <XCircle className="mt-0.5 size-5 text-warning" aria-hidden />}
            <div>
              <p className="font-semibold text-ink">{passed ? "Passed" : "Not yet"} — {state.score}/{state.maxScore}</p>
              <p className="mt-1 text-sm text-ink-muted">{state.message}</p>
              {state.certificateCode ? (
                <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-gold-soft px-3 py-1.5 text-sm text-ink"><Award className="size-4 text-gold" aria-hidden />That was the last lesson — your certificate has been issued.</p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {passed && nextHref ? <ButtonLink href={nextHref}>Continue to next lesson</ButtonLink> : null}
            {state.certificateCode ? <ButtonLink href="/campus/certificates" variant="outline">View certificate</ButtonLink> : null}
            <Button variant="outline" onClick={retake}><RotateCcw className="size-4" aria-hidden />Retake</Button>
          </div>
        </div>
      ) : null}

      <form key={key} action={action} className="space-y-6">
        <input type="hidden" name="lessonId" value={lessonId} />
        {questions.map((q, qi) => {
          const result = results?.get(q.id);
          return (
            <fieldset key={q.id} className={cn("rounded-xl border bg-surface p-5", result ? (result.correct ? "border-success/40" : "border-danger/40") : "border-line")} disabled={Boolean(results)}>
              <legend className="px-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">Question {qi + 1} of {questions.length}</legend>
              <p className="mt-2 text-[1.0625rem] font-medium text-ink">{q.prompt}</p>
              <div className="mt-4 space-y-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[q.id] === oi;
                  const isAnswer = result ? result.answer === oi : false;
                  return (
                    <label
                      key={oi}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-[0.9375rem] transition-colors",
                        chosen ? "border-accent bg-accent-soft/60" : "border-line hover:bg-surface-2",
                        result && isAnswer && "border-success bg-success-soft",
                        result && chosen && !result.correct && "border-danger bg-danger-soft",
                      )}
                    >
                      <input
                        type="radio"
                        name={`answers[${qi}]`}
                        value={oi}
                        checked={chosen}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className="mt-1 accent-[var(--accent)]"
                        required
                      />
                      <span className="text-ink">{opt}</span>
                    </label>
                  );
                })}
              </div>
              {result ? (
                <p className={cn("mt-4 rounded-md px-3 py-2 text-sm", result.correct ? "bg-success-soft text-ink" : "bg-surface-2 text-ink")}>
                  <span className="font-semibold">{result.correct ? "Correct. " : "Not quite. "}</span>
                  {result.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}

        {!results ? (
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" loading={pending} disabled={answered < questions.length}>Submit answers</Button>
            <p className="text-sm text-ink-muted tabular" aria-live="polite">{answered}/{questions.length} answered · 70% to pass</p>
          </div>
        ) : null}
        {state && !state.ok && state.message ? <p role="alert" className="text-sm font-medium text-danger">{state.message}</p> : null}
      </form>
    </div>
  );
}
