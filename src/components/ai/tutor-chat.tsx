"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, BrainCircuit, Loader2, Sparkles, Square } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ChatMessage = { id: string; role: "USER" | "ASSISTANT"; content: string; pending?: boolean };

export type TutorChatProps = {
  conversationId?: string;
  initialMessages?: ChatMessage[];
  context?: { courseId?: string; lessonId?: string; lessonTitle?: string; courseTitle?: string };
  mode?: "tutor" | "lab";
  /** Called before each send so the lab can attach the learner's current code. */
  getLabCode?: () => string | undefined;
  suggestions?: string[];
  userName: string;
  compact?: boolean;
  aiEnabled: boolean;
  onConversationCreated?: (id: string) => void;
  className?: string;
};

function parseSse(buffer: string): { events: { event: string; data: string }[]; rest: string } {
  const events: { event: string; data: string }[] = [];
  const chunks = buffer.split("\n\n");
  const rest = chunks.pop() ?? "";
  for (const chunk of chunks) {
    let event = "message";
    const data: string[] = [];
    for (const line of chunk.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trim());
    }
    if (data.length) events.push({ event, data: data.join("\n") });
  }
  return { events, rest };
}

export function TutorChat({ conversationId: initialConversationId, initialMessages = [], context, mode = "tutor", getLabCode, suggestions = [], userName, compact, aiEnabled, onConversationCreated, className }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const seq = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [lastConversationId, setLastConversationId] = useState(initialConversationId);
  if (lastConversationId !== initialConversationId) {
    setLastConversationId(initialConversationId);
    setConversationId(initialConversationId);
    setMessages(initialMessages);
  }

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
      const message = text.trim();
      if (!message || streaming || !aiEnabled) return;
      setError(null);
      setInput("");
      const turn = ++seq.current;
      const userMsg: ChatMessage = { id: `u-${turn}`, role: "USER", content: message };
      const assistantId = `a-${turn}`;
      setMessages((m) => [...m, userMsg, { id: assistantId, role: "ASSISTANT", content: "", pending: true }]);
      setStreaming(true);
      const controller = new AbortController();
      abort.current = controller;

      try {
        const res = await fetch("/api/ai/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message, courseId: context?.courseId, lessonId: context?.lessonId, labCode: getLabCode?.(), mode }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(data.message ?? `The tutor is unavailable (${res.status}).`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;
        while (!done) {
          const chunk = await reader.read();
          done = chunk.done;
          if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true });
          const parsed = parseSse(buffer);
          buffer = parsed.rest;
          for (const ev of parsed.events) {
            const data = JSON.parse(ev.data) as Record<string, unknown>;
            if (ev.event === "meta" && typeof data.conversationId === "string") {
              if (!conversationId) {
                setConversationId(data.conversationId);
                onConversationCreated?.(data.conversationId);
              }
            } else if (ev.event === "delta" && typeof data.text === "string") {
              const delta = data.text;
              setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + delta, pending: false } : msg)));
            } else if (ev.event === "error" && typeof data.message === "string") {
              setError(data.message);
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError((err as Error).message);
      } finally {
        setStreaming(false);
        setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, pending: false } : msg)).filter((msg) => !(msg.id === assistantId && !msg.content)));
        abort.current = null;
        textarea.current?.focus();
      }
  };

  const stop = () => abort.current?.abort();

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={scroller} className="scroll-thin min-h-0 flex-1 overflow-y-auto" aria-live="polite" aria-busy={streaming}>
        {messages.length === 0 ? (
          <div className={cn("flex flex-col items-start gap-4", compact ? "p-4" : "p-6")}>
            <div className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent-strong">
              <BrainCircuit className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-[0.9375rem] font-semibold text-ink">{context?.lessonTitle ? `Ask about “${context.lessonTitle}”` : "Ask the tutor"}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {aiEnabled
                  ? "It asks before it answers, and it will not do graded work for you. It can see this lesson and your lab code."
                  : "AI features are not configured on this deployment. Add an Anthropic API key to enable the tutor."}
              </p>
            </div>
            {aiEnabled && suggestions.length ? (
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => void send(s)} className="rounded-full border border-line-strong px-3 py-1.5 text-left text-[0.8125rem] text-ink-muted transition-colors hover:border-ink hover:text-ink">
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <ol className={cn("space-y-5", compact ? "p-4" : "p-6")}>
            {messages.map((m) => (
              <li key={m.id} className={cn("flex gap-3", m.role === "USER" && "flex-row-reverse")}>
                {m.role === "ASSISTANT" ? (
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-strong"><Sparkles className="size-3.5" aria-hidden /></span>
                ) : (
                  <Avatar name={userName} size="xs" className="mt-0.5" />
                )}
                <div className={cn("min-w-0 max-w-[85%] rounded-xl px-4 py-3 text-[0.9375rem]", m.role === "USER" ? "bg-ink text-bg" : "bg-surface-2 text-ink")}>
                  {m.role === "ASSISTANT" ? (
                    m.pending && !m.content ? (
                      <span className="inline-flex items-center gap-2 text-sm text-ink-muted"><Loader2 className="size-3.5 animate-spin" aria-hidden />Thinking…</span>
                    ) : (
                      <Markdown content={m.content} className="text-[0.9375rem] [&_pre]:text-[0.8125rem]" />
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {error ? (
        <p role="alert" className="mx-4 mb-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-[0.8125rem] text-danger">{error}</p>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className={cn("border-t border-line", compact ? "p-3" : "p-4")}
      >
        <div className="flex items-end gap-2 rounded-xl border border-line-strong bg-surface p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
          <label htmlFor={`tutor-input-${mode}`} className="sr-only">Message the tutor</label>
          <textarea
            id={`tutor-input-${mode}`}
            ref={textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={compact ? 2 : 3}
            disabled={!aiEnabled}
            placeholder={aiEnabled ? "Ask a question… (Enter to send, Shift+Enter for a new line)" : "AI is not configured"}
            className="min-h-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.9375rem] text-ink placeholder:text-ink-subtle focus:outline-none disabled:opacity-60"
          />
          {streaming ? (
            <button type="button" onClick={stop} className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink hover:bg-surface-3" aria-label="Stop generating">
              <Square className="size-4" aria-hidden />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim() || !aiEnabled} className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-ink transition hover:bg-accent-strong disabled:opacity-40" aria-label="Send">
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-2 text-[0.6875rem] text-ink-subtle">The tutor can make mistakes. Check important claims against the lesson.</p>
      </form>
    </div>
  );
}
