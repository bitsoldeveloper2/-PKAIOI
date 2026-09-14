"use client";

import { useState } from "react";
import { BrainCircuit, NotebookPen } from "lucide-react";
import { TutorChat } from "@/components/ai/tutor-chat";
import { NotesPanel } from "./notes-panel";
import { labCodeStore } from "./lab-code-store";
import { cn } from "@/lib/utils";

export function LessonSidePanel({
  lessonId,
  lessonTitle,
  courseId,
  courseTitle,
  note,
  suggestions,
  userName,
  aiEnabled,
  isLab,
}: {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  note: string;
  suggestions: string[];
  userName: string;
  aiEnabled: boolean;
  isLab: boolean;
}) {
  const [tab, setTab] = useState<"tutor" | "notes">("tutor");

  return (
    <aside className="flex min-h-[32rem] flex-col border-t border-line bg-surface xl:sticky xl:top-14 xl:h-[calc(100dvh-3.5rem)] xl:border-l xl:border-t-0" aria-label="Lesson tools">
      <div role="tablist" aria-label="Lesson tools" className="flex border-b border-line">
        {(
          [
            { id: "tutor", label: "Tutor", icon: BrainCircuit },
            { id: "notes", label: "Notes", icon: NotebookPen },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`side-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`side-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === t.id ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            <t.icon className="size-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>
      <div id="side-panel-tutor" role="tabpanel" aria-labelledby="side-tab-tutor" hidden={tab !== "tutor"} className="flex min-h-0 flex-1 flex-col">
        <TutorChat
          key={lessonId}
          context={{ courseId, lessonId, lessonTitle, courseTitle }}
          mode={isLab ? "lab" : "tutor"}
          getLabCode={isLab ? () => labCodeStore.get() : undefined}
          suggestions={suggestions}
          userName={userName}
          aiEnabled={aiEnabled}
          compact
          className="min-h-0 flex-1"
        />
      </div>
      <div id="side-panel-notes" role="tabpanel" aria-labelledby="side-tab-notes" hidden={tab !== "notes"} className="min-h-0 flex-1">
        <NotesPanel lessonId={lessonId} initial={note} />
      </div>
    </aside>
  );
}
