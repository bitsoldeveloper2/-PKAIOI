import type { Metadata } from "next";
import { requireUser } from "@/server/auth/dal";
import { getConversation, listConversations } from "@/server/queries/campus";
import { aiEnabled } from "@/lib/env";
import { TutorWorkspace } from "./tutor-workspace";

export const metadata: Metadata = { title: "Tutor" };

export default async function TutorPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const [user, { c }] = await Promise.all([requireUser("/campus/tutor"), searchParams]);
  const [conversations, current] = await Promise.all([listConversations(user.id), c ? getConversation(user.id, c) : Promise.resolve(null)]);

  return (
    <TutorWorkspace
      userName={user.name}
      aiEnabled={aiEnabled}
      conversations={conversations.map((x) => ({ id: x.id, title: x.title, updatedAt: x.updatedAt.toISOString(), count: x._count.messages, mode: x.mode }))}
      current={
        current
          ? {
              id: current.id,
              title: current.title,
              courseId: current.courseId ?? undefined,
              lessonId: current.lessonId ?? undefined,
              messages: current.messages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
            }
          : null
      }
    />
  );
}
