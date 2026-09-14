"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Award, CheckCircle2, CircleDashed, Lightbulb, Loader2, Play, RotateCcw, Sparkles, Terminal, Upload, XCircle } from "lucide-react";
import { submitLabAction, type LessonActionState } from "@/server/actions/campus";
import type { LabSpec } from "@/server/queries/campus";
import { LabRunner, type LabPhase, type LabTestResult } from "@/lib/lab-runner";
import { CodeEditor } from "@/components/code-editor";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { labCodeStore } from "./lab-code-store";

type OutputLine = { kind: "stdout" | "stderr" | "info"; text: string };
type LastSubmission = { code: string; passed: boolean; results: LabTestResult[]; createdAt: Date } | null;

const PHASE_LABEL: Record<LabPhase, string> = {
  idle: "Ready",
  "loading-runtime": "Loading the Python runtime (first run only)…",
  running: "Running your code…",
  testing: "Running tests…",
  done: "Finished",
  error: "Stopped",
};

export function LabWorkbench({ lessonId, lab, lastSubmission, aiEnabled, brief, nextHref }: { lessonId: string; lab: LabSpec; lastSubmission: LastSubmission; aiEnabled: boolean; brief: string; nextHref: Route | null }) {
  const storageKey = `pioai:lab:${lessonId}`;
  const [code, setCode] = useState(lab.starterCode);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [tests, setTests] = useState<LabTestResult[]>(lastSubmission?.results ?? []);
  const [phase, setPhase] = useState<LabPhase>("idle");
  const [lastRunOk, setLastRunOk] = useState<boolean | null>(lastSubmission?.passed ?? null);
  const [ai, setAi] = useState<{ mode: string; text: string } | null>(null);
  const [aiBusy, startAi] = useTransition();
  const [state, submit, submitting] = useActionState<LessonActionState | undefined, FormData>(submitLabAction, undefined);
  const runner = useMemo(() => new LabRunner(), []);
  const router = useRouter();
  const outputRef = useRef<HTMLDivElement>(null);

  // Restore an unsaved draft, then keep the tutor's view of the code current.
  useEffect(() => {
    // Restore the learner's unsaved draft once after hydration; localStorage does not exist during SSR.
    let initial = lastSubmission?.code ?? lab.starterCode;
    try {
      initial = localStorage.getItem(storageKey) ?? initial;
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(initial);
    labCodeStore.set(initial);
    if (lab.language === "python") runner.warmup();
    return () => runner.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    labCodeStore.set(code);
    try {
      localStorage.setItem(storageKey, code);
    } catch {
      /* storage unavailable */
    }
  }, [code, storageKey]);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [output]);

  const run = useCallback(() => {
    setOutput([]);
    setTests([]);
    setLastRunOk(null);
    setAi(null);
    runner.run(lab.language, code, lab.tests, {
      onPhase: (p) => setPhase(p),
      onStdout: (text) => setOutput((o) => [...o, { kind: "stdout", text }]),
      onStderr: (text) => setOutput((o) => [...o, { kind: "stderr", text }]),
      onTest: (t) => setTests((list) => [...list, t]),
      onDone: ({ ok, durationMs }) => {
        setLastRunOk(ok);
        setOutput((o) => [...o, { kind: "info", text: `${ok ? "All tests passed" : "Some tests failed"} · ${(durationMs / 1000).toFixed(1)}s` }]);
      },
      onError: (message) => setOutput((o) => [...o, { kind: "stderr", text: message }]),
    });
  }, [code, lab.language, lab.tests, runner]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const askAi = (mode: "hint" | "review" | "explain-error") => {
    startAi(async () => {
      try {
        const res = await fetch("/api/ai/lab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: lab.language,
            code,
            brief: brief.slice(0, 8000),
            mode,
            output: output.map((l) => l.text).join("").slice(-4000),
            failing: tests.filter((t) => !t.passed).map((t) => ({ name: t.name, output: t.output })),
          }),
        });
        const data = (await res.json()) as { text?: string; message?: string };
        setAi({ mode, text: data.text ?? data.message ?? "No response." });
      } catch {
        setAi({ mode, text: "The AI reviewer could not be reached." });
      }
    });
  };

  const busy = phase === "loading-runtime" || phase === "running" || phase === "testing";
  const passedCount = tests.filter((t) => t.passed).length;

  return (
    <section aria-labelledby="lab-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="lab-title" className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
          <Terminal className="size-4 text-accent" aria-hidden />
          Workbench · {lab.language === "python" ? "Python" : "JavaScript"}
        </h2>
        <p className="text-[0.8125rem] text-ink-muted" aria-live="polite">{busy ? <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" aria-hidden />{PHASE_LABEL[phase]}</span> : "Runs in your browser · Ctrl/⌘ + Enter to run"}</p>
      </div>

      <CodeEditor value={code} onChange={setCode} language={lab.language} ariaLabel={`${lab.language} lab editor`} minHeight="18rem" />

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} loading={busy} size="md"><Play className="size-4" aria-hidden />Run tests</Button>
        <Button variant="outline" onClick={() => { setCode(lab.starterCode); setOutput([]); setTests([]); setLastRunOk(null); }}><RotateCcw className="size-4" aria-hidden />Reset</Button>
        {aiEnabled ? (
          <>
            <Button variant="ghost" onClick={() => askAi("hint")} loading={aiBusy}><Lightbulb className="size-4" aria-hidden />Hint</Button>
            <Button variant="ghost" onClick={() => askAi(tests.some((t) => !t.passed) ? "explain-error" : "review")} loading={aiBusy}><Sparkles className="size-4" aria-hidden />{tests.some((t) => !t.passed) ? "Explain failure" : "Review my code"}</Button>
          </>
        ) : null}
        <form action={submit} className="ml-auto">
          <input type="hidden" name="lessonId" value={lessonId} />
          <input type="hidden" name="language" value={lab.language} />
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="results" value={JSON.stringify(tests)} />
          <Button type="submit" variant="secondary" loading={submitting} disabled={tests.length === 0}><Upload className="size-4" aria-hidden />Submit</Button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <div ref={outputRef} className="scroll-thin max-h-56 min-h-28 overflow-y-auto rounded-lg border border-line bg-[#0e1216] p-3 font-mono text-[0.8125rem] leading-relaxed text-[#e6e8eb]" role="log" aria-label="Program output" aria-live="polite">
          {output.length === 0 ? <p className="text-white/70">Output will appear here.</p> : output.map((l, i) => (
            <pre key={i} className={cn("whitespace-pre-wrap", l.kind === "stderr" && "text-[#f2a0a0]", l.kind === "info" && "mt-1 text-[#8fd7bb]")}>{l.text}</pre>
          ))}
        </div>
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">Tests {tests.length ? `· ${passedCount}/${lab.tests.length}` : ""}</p>
          <ul className="mt-2 space-y-1.5">
            {lab.tests.map((t) => {
              const r = tests.find((x) => x.name === t.name);
              return (
                <li key={t.name} className="flex items-start gap-2 text-[0.8125rem]">
                  {r ? (r.passed ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" aria-label="passed" /> : <XCircle className="mt-0.5 size-3.5 shrink-0 text-danger" aria-label="failed" />) : <CircleDashed className="mt-0.5 size-3.5 shrink-0 text-ink-subtle" aria-label="not run" />}
                  <span className="min-w-0">
                    <span className="block text-ink">{t.name}</span>
                    {r && !r.passed && r.output ? <span className="block truncate font-mono text-[0.75rem] text-danger" title={r.output}>{r.output}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {ai ? (
        <div className="rounded-xl border border-accent/30 bg-accent-soft/50 p-4" role="status">
          <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-accent-strong"><Sparkles className="size-3.5" aria-hidden />{ai.mode === "hint" ? "Hint" : ai.mode === "review" ? "Review" : "Explanation"}</p>
          <Markdown content={ai.text} className="mt-2 text-[0.9375rem]" />
        </div>
      ) : null}

      {state?.message ? (
        <div role="status" className={cn("rounded-xl border p-4", state.ok ? "border-success/30 bg-success-soft" : "border-danger/30 bg-danger-soft")}>
          <p className="text-sm text-ink">{state.message}</p>
          {state.certificateCode ? <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink"><Award className="size-4 text-gold" aria-hidden />That was the last lesson — your certificate has been issued.</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {state.ok && lastRunOk && nextHref ? <ButtonLink href={nextHref} size="sm">Continue to next lesson</ButtonLink> : null}
            {state.certificateCode ? <ButtonLink href="/campus/certificates" size="sm" variant="outline">View certificate</ButtonLink> : null}
          </div>
        </div>
      ) : lastSubmission ? (
        <p className="text-sm text-ink-muted">Last submission: <Badge tone={lastSubmission.passed ? "success" : "warning"}>{lastSubmission.passed ? "passed" : "in progress"}</Badge></p>
      ) : null}
    </section>
  );
}
