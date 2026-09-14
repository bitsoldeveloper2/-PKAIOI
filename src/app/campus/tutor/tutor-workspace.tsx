"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { TutorChat, type ChatMessage } from "@/components/ai/tutor-chat";
import { PageHeader } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { cn, relativeTime } from "@/lib/utils";

type ConversationSummary = { id: string; title: string; updatedAt: string; count: number; mode: string };
type Current = { id: string; title: string; courseId?: string; lessonId?: string; messages: ChatMessage[] } | null;

const SUGGESTIONS = [
  "Explain cross-validation like I'm a product manager",
  "What's the difference between precision and recall, with a Pakistani example?",
  "Quiz me on prompt caching",
  "How should I structure an evaluation set for a RAG assistant?",
];

export function TutorWorkspace({ userName, aiEnabled, conversations, current }: { userName: string; aiEnabled: boolean; conversations: ConversationSummary[]; current: Current }) {
  const router = useRouter();
  const [draftKey, setDraftKey] = useState(0);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader
        eyebrow="AI on campus"
        title="Tutor"
        lede="Ask about any course, lesson or idea. It asks before it answers, and it will not do graded work for you."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setDraftKey((k) => k + 1);
              router.push("/campus/tutor" as Route);
            }}
          >
            <MessageSquarePlus className="size-4" aria-hidden />
            New conversation
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="rounded-xl border border-line bg-surface" aria-label="Conversations">
          <p className="border-b border-line px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">Recent</p>
          {conversations.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-muted">No conversations yet.</p>
          ) : (
            <ul className="scroll-thin max-h-[60dvh] overflow-y-auto p-2">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/campus/tutor?c=${c.id}` as Route}
                    aria-current={current?.id === c.id ? "page" : undefined}
                    className={cn("block rounded-md px-3 py-2 transition-colors hover:bg-surface-2", current?.id === c.id && "bg-accent-soft")}
                  >
                    <span className="block truncate text-sm font-medium text-ink">{c.title}</span>
                    <span className="block text-xs text-ink-muted">{c.count} messages · {relativeTime(c.updatedAt)}{c.mode === "lab" ? " · lab" : ""}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-line bg-surface" aria-label="Chat">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <MessagesSquare className="size-4 text-ink-muted" aria-hidden />
            <p className="truncate text-sm font-medium text-ink">{current?.title ?? "New conversation"}</p>
          </div>
          <TutorChat
            key={current?.id ?? `draft-${draftKey}`}
            conversationId={current?.id}
            initialMessages={current?.messages ?? []}
            context={current ? { courseId: current.courseId, lessonId: current.lessonId } : undefined}
            suggestions={SUGGESTIONS}
            userName={userName}
            aiEnabled={aiEnabled}
            onConversationCreated={(id) => router.replace(`/campus/tutor?c=${id}` as Route)}
            className="min-h-0 flex-1"
          />
        </section>
      </div>
    </div>
  );
}
