"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Loader2, Play, Sparkles, Terminal, Trash2 } from "lucide-react";
import { LabRunner, type LabPhase } from "@/lib/lab-runner";
import { CodeEditor, type EditorLanguage } from "@/components/code-editor";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Badge, Chip } from "@/components/ui/badge";
import { cn, relativeTime } from "@/lib/utils";

const SAMPLES: Record<EditorLanguage, string> = {
  python: `# Python runs here in your browser (Pyodide). Try it:
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fib(i) for i in range(12)])
`,
  javascript: `// JavaScript runs in an isolated worker. Try it:
function fib(n) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

console.log(Array.from({ length: 12 }, (_, i) => fib(i)));
`,
};

type Recent = { id: string; language: string; passed: boolean; createdAt: string; lessonTitle: string; courseTitle: string; href: string };
type OutputLine = { kind: "stdout" | "stderr" | "info"; text: string };

export function LabPlayground({ aiEnabled, recent }: { aiEnabled: boolean; recent: Recent[] }) {
  const [language, setLanguage] = useState<EditorLanguage>("python");
  const [code, setCode] = useState(SAMPLES.python);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [phase, setPhase] = useState<LabPhase>("idle");
  const [review, setReview] = useState<string | null>(null);
  const [aiBusy, startAi] = useTransition();
  const runner = useMemo(() => new LabRunner(), []);
  const outputRef = useRef<HTMLDivElement>(null);

  const loadDraft = (lang: EditorLanguage) => {
    try {
      return localStorage.getItem(`pioai:playground:${lang}`) ?? SAMPLES[lang];
    } catch {
      return SAMPLES[lang];
    }
  };

  const switchLanguage = (lang: EditorLanguage) => {
    setLanguage(lang);
    setCode(loadDraft(lang));
    if (lang === "python") runner.warmup();
  };

  useEffect(() => {
    // Restore the persisted draft once after hydration (localStorage is not available during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(loadDraft("python"));
    runner.warmup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`pioai:playground:${language}`, code);
    } catch {
      /* ignore */
    }
  }, [code, language]);

  useEffect(() => () => runner.terminate(), [runner]);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [output]);

  const run = useCallback(() => {
    setOutput([]);
    setReview(null);
    runner.run(language, code, [], {
      onPhase: setPhase,
      onStdout: (text) => setOutput((o) => [...o, { kind: "stdout", text }]),
      onStderr: (text) => setOutput((o) => [...o, { kind: "stderr", text }]),
      onDone: ({ durationMs }) => setOutput((o) => [...o, { kind: "info", text: `Finished in ${(durationMs / 1000).toFixed(2)}s` }]),
      onError: (message) => setOutput((o) => [...o, { kind: "stderr", text: message }]),
    });
  }, [code, language, runner]);

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

  const askReview = () => {
    startAi(async () => {
      try {
        const res = await fetch("/api/ai/lab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code, mode: "review", output: output.map((l) => l.text).join("").slice(-4000) }),
        });
        const data = (await res.json()) as { text?: string; message?: string };
        setReview(data.text ?? data.message ?? "No response.");
      } catch {
        setReview("The AI reviewer could not be reached.");
      }
    });
  };

  const busy = phase === "loading-runtime" || phase === "running";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <section className="space-y-4" aria-label="Playground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="group" aria-label="Language">
            <Chip active={language === "python"} onClick={() => switchLanguage("python")}>Python</Chip>
            <Chip active={language === "javascript"} onClick={() => switchLanguage("javascript")}>JavaScript</Chip>
          </div>
          <p className="text-[0.8125rem] text-ink-muted" aria-live="polite">
            {busy ? <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3.5 animate-spin" aria-hidden />{phase === "loading-runtime" ? "Loading the Python runtime…" : "Running…"}</span> : "Ctrl/⌘ + Enter to run"}
          </p>
        </div>
        <CodeEditor value={code} onChange={setCode} language={language} ariaLabel={`${language} playground editor`} minHeight="20rem" />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={run} loading={busy}><Play className="size-4" aria-hidden />Run</Button>
          <Button variant="outline" onClick={() => setCode(SAMPLES[language])}><Trash2 className="size-4" aria-hidden />Reset</Button>
          {aiEnabled ? <Button variant="ghost" onClick={askReview} loading={aiBusy}><Sparkles className="size-4" aria-hidden />Review my code</Button> : null}
        </div>
        <div ref={outputRef} className="scroll-thin max-h-64 min-h-32 overflow-y-auto rounded-lg border border-line bg-[#0e1216] p-3 font-mono text-[0.8125rem] leading-relaxed text-[#e6e8eb]" role="log" aria-label="Program output" aria-live="polite">
          {output.length === 0 ? <p className="inline-flex items-center gap-2 text-white/70"><Terminal className="size-3.5" aria-hidden />Output will appear here.</p> : output.map((l, i) => (
            <pre key={i} className={cn("whitespace-pre-wrap", l.kind === "stderr" && "text-[#f2a0a0]", l.kind === "info" && "mt-1 text-[#8fd7bb]")}>{l.text}</pre>
          ))}
        </div>
        {review ? (
          <div className="rounded-xl border border-accent/30 bg-accent-soft/50 p-4" role="status">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-accent-strong"><Sparkles className="size-3.5" aria-hidden />Review</p>
            <Markdown content={review} className="mt-2 text-[0.9375rem]" />
          </div>
        ) : null}
      </section>

      <aside className="space-y-4" aria-label="Recent lab work">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">Recent lab submissions</p>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Labs you submit inside courses will show up here.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recent.map((r) => (
                <li key={r.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                  <Link href={r.href as Route} className="text-sm font-medium text-ink hover:text-accent">{r.lessonTitle}</Link>
                  <p className="text-xs text-ink-muted">{r.courseTitle}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-ink-subtle">
                    <Badge tone={r.passed ? "success" : "warning"}>{r.passed ? "passed" : "in progress"}</Badge>
                    {r.language} · {relativeTime(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
          <p className="font-semibold text-ink">How the lab works</p>
          <p className="mt-2">Code runs in a web worker in your browser — Python through a self-hosted Pyodide runtime, JavaScript in an isolated scope. Nothing is sent to a server unless you ask the AI reviewer.</p>
        </div>
      </aside>
    </div>
  );
}
