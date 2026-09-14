"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveNoteAction } from "@/server/actions/campus";

const DEBOUNCE_MS = 800;

function noteForm(lessonId: string, body: string) {
  const form = new FormData();
  form.set("lessonId", lessonId);
  form.set("body", body);
  return form;
}

export function NotesPanel({ lessonId, initial }: { lessonId: string; initial: string }) {
  const [body, setBody] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Text typed since the last save, or null when nothing is pending. */
  const pending = useRef<string | null>(null);

  const [lastLesson, setLastLesson] = useState(lessonId);
  if (lastLesson !== lessonId) {
    setLastLesson(lessonId);
    setBody(initial);
    setStatus("idle");
  }

  const persist = (text: string) => {
    pending.current = null;
    setStatus("saving");
    startTransition(async () => {
      const result = await saveNoteAction(undefined, noteForm(lessonId, text));
      setStatus(result.ok ? "saved" : "error");
    });
  };

  const cancelTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setBody(next);
    setStatus("idle");
    pending.current = next;
    cancelTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      if (pending.current !== null) persist(pending.current);
    }, DEBOUNCE_MS);
  };

  const flush = () => {
    if (pending.current === null) return;
    cancelTimer();
    persist(pending.current);
  };

  // Leaving the lesson (or the page) must not lose the last few keystrokes.
  useEffect(() => {
    return () => {
      const text = pending.current;
      cancelTimer();
      pending.current = null;
      if (text !== null) void saveNoteAction(undefined, noteForm(lessonId, text));
    };
  }, [lessonId]);

  return (
    <div className="flex h-full flex-col p-4">
      <label htmlFor="lesson-notes" className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">Your notes for this lesson</label>
      <textarea
        id="lesson-notes"
        value={body}
        onChange={onChange}
        onBlur={flush}
        placeholder="Write as you learn. Notes save automatically and are private to you."
        className="scroll-thin mt-2 min-h-[16rem] flex-1 resize-none rounded-lg border border-line-strong bg-surface p-3 text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        maxLength={10_000}
      />
      <p className="mt-2 text-[0.75rem] text-ink-subtle" aria-live="polite">
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Could not save — check your connection" : `${body.length.toLocaleString()} / 10,000`}
      </p>
    </div>
  );
}
