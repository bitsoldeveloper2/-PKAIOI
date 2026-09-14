"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, FileText, FlaskConical, GripVertical, HelpCircle, Pencil, PlayCircle, Plus, Trash2 } from "lucide-react";
import { addLessonAction, addModuleAction, deleteLessonAction, deleteModuleAction, reorderLessonsAction, reorderModulesAction, updateModuleAction } from "@/server/actions/studio";
import type { LabSpec, QuizQuestion } from "@/server/queries/campus";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { LessonEditor, type EditableLesson } from "./lesson-editor";

export type BuilderLesson = {
  id: string;
  title: string;
  type: "VIDEO" | "ARTICLE" | "QUIZ" | "LAB";
  order: number;
  durationMinutes: number;
  content: string;
  videoUrl: string | null;
  quiz: QuizQuestion[];
  lab: LabSpec | null;
  isPreview: boolean;
};
export type BuilderModule = { id: string; title: string; summary: string | null; order: number; lessons: BuilderLesson[] };

const ICON = { VIDEO: PlayCircle, ARTICLE: FileText, QUIZ: HelpCircle, LAB: FlaskConical } as const;

function SortableLesson({ lesson, onEdit, onDelete }: { lesson: BuilderLesson; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const Icon = ICON[lesson.type];
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-2", isDragging && "z-10 shadow-lift")}>
      <button type="button" className="cursor-grab rounded p-1 text-ink-subtle hover:bg-surface-2 active:cursor-grabbing" aria-label={`Reorder lesson ${lesson.title}`} {...attributes} {...listeners}>
        <GripVertical className="size-4" aria-hidden />
      </button>
      <Icon className="size-4 shrink-0 text-ink-subtle" aria-hidden />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 truncate text-left text-sm text-ink hover:text-accent">{lesson.title}</button>
      {lesson.isPreview ? <Eye className="size-3.5 text-ink-subtle" aria-label="Preview lesson" /> : null}
      <span className="w-10 text-right text-xs tabular text-ink-subtle">{lesson.durationMinutes}m</span>
      <button type="button" onClick={onEdit} className="rounded p-1.5 text-ink-subtle hover:bg-surface-2 hover:text-ink" aria-label={`Edit ${lesson.title}`}><Pencil className="size-3.5" aria-hidden /></button>
      <button type="button" onClick={onDelete} className="rounded p-1.5 text-ink-subtle hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${lesson.title}`}><Trash2 className="size-3.5" aria-hidden /></button>
    </li>
  );
}

function ModuleCard({ module: mod, courseId, onEditLesson }: { module: BuilderModule; courseId: string; onEditLesson: (l: BuilderLesson) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id });
  const [lessons, setLessons] = useState(mod.lessons);
  const [lastLessons, setLastLessons] = useState(mod.lessons);
  if (lastLessons !== mod.lessons) {
    setLastLessons(mod.lessons);
    setLessons(mod.lessons);
  }
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = lessons.findIndex((l) => l.id === active.id);
    const to = lessons.findIndex((l) => l.id === over.id);
    const next = arrayMove(lessons, from, to);
    setLessons(next);
    startTransition(async () => {
      await reorderLessonsAction(mod.id, next.map((l) => l.id));
      router.refresh();
    });
  };

  const run = (fn: () => Promise<void>, success: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast({ title: success, variant: "success" });
        router.refresh();
      } catch (err) {
        toast({ title: "Something went wrong", description: (err as Error).message, variant: "error" });
      }
    });

  return (
    <section ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("rounded-xl border border-line bg-surface", isDragging && "z-10 shadow-lift")} aria-labelledby={`m-${mod.id}`} aria-busy={pending}>
      <header className="flex items-center gap-2 border-b border-line px-3 py-3">
        <button type="button" className="cursor-grab rounded p-1 text-ink-subtle hover:bg-surface-2 active:cursor-grabbing" aria-label={`Reorder module ${mod.title}`} {...attributes} {...listeners}>
          <GripVertical className="size-4" aria-hidden />
        </button>
        {editing ? (
          <form
            className="flex flex-1 flex-wrap items-center gap-2"
            action={(fd) => {
              setEditing(false);
              run(() => updateModuleAction(fd), "Module updated");
            }}
          >
            <input type="hidden" name="moduleId" value={mod.id} />
            <Input name="title" defaultValue={mod.title} aria-label="Module title" className="h-9 max-w-xs" required />
            <Input name="summary" defaultValue={mod.summary ?? ""} aria-label="Module summary" placeholder="Summary (optional)" className="h-9 flex-1" />
            <Button type="submit" size="sm">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h3 id={`m-${mod.id}`} className="truncate text-[0.9375rem] font-semibold text-ink">{mod.title}</h3>
              {mod.summary ? <p className="truncate text-xs text-ink-muted">{mod.summary}</p> : null}
            </div>
            <span className="text-xs tabular text-ink-subtle">{lessons.length} lessons</span>
            <button type="button" onClick={() => setEditing(true)} className="rounded p-1.5 text-ink-subtle hover:bg-surface-2 hover:text-ink" aria-label={`Rename ${mod.title}`}><Pencil className="size-3.5" aria-hidden /></button>
            <button
              type="button"
              onClick={() => {
                if (!confirm(`Delete module “${mod.title}” and its ${lessons.length} lessons?`)) return;
                const fd = new FormData();
                fd.set("moduleId", mod.id);
                run(() => deleteModuleAction(fd), "Module deleted");
              }}
              className="rounded p-1.5 text-ink-subtle hover:bg-danger-soft hover:text-danger"
              aria-label={`Delete ${mod.title}`}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </>
        )}
      </header>

      <div className="p-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ol className="space-y-1.5">
              {lessons.map((l) => (
                <SortableLesson
                  key={l.id}
                  lesson={l}
                  onEdit={() => onEditLesson(l)}
                  onDelete={() => {
                    if (!confirm(`Delete lesson “${l.title}”? Learner progress on it is removed too.`)) return;
                    const fd = new FormData();
                    fd.set("lessonId", l.id);
                    run(() => deleteLessonAction(fd), "Lesson deleted");
                  }}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>

        <form
          className="mt-3 flex flex-wrap items-center gap-2"
          action={(fd) => run(() => addLessonAction(fd), "Lesson added")}
        >
          <input type="hidden" name="moduleId" value={mod.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <Input name="title" placeholder="New lesson title" aria-label="New lesson title" className="h-9 min-w-48 flex-1" required minLength={2} />
          <Select name="type" defaultValue="ARTICLE" aria-label="Lesson type" className="h-9 w-36">
            <option value="ARTICLE">Reading</option>
            <option value="VIDEO">Lecture video</option>
            <option value="QUIZ">Quiz</option>
            <option value="LAB">Coding lab</option>
          </Select>
          <Button type="submit" size="sm" variant="outline"><Plus className="size-3.5" aria-hidden />Add lesson</Button>
        </form>
      </div>
    </section>
  );
}

export function CourseBuilder({ courseId, modules: initial }: { courseId: string; modules: BuilderModule[] }) {
  const [modules, setModules] = useState(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  if (lastInitial !== initial) {
    setLastInitial(initial);
    setModules(initial);
  }
  const [editing, setEditing] = useState<EditableLesson | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = modules.findIndex((m) => m.id === active.id);
    const to = modules.findIndex((m) => m.id === over.id);
    const next = arrayMove(modules, from, to);
    setModules(next);
    startTransition(async () => {
      await reorderModulesAction(courseId, next.map((m) => m.id));
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" aria-busy={pending}>
      <p className="text-sm text-ink-muted">Drag to reorder modules and lessons. Click a lesson to edit its content, quiz or lab. Changes go live immediately on published courses.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {modules.map((m) => (
              <ModuleCard key={m.id} module={m} courseId={courseId} onEditLesson={(l) => setEditing(l)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <form
        className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-line-strong p-3"
        action={(fd) =>
          startTransition(async () => {
            try {
              await addModuleAction(fd);
              toast({ title: "Module added", variant: "success" });
              router.refresh();
            } catch (err) {
              toast({ title: "Could not add module", description: (err as Error).message, variant: "error" });
            }
          })
        }
      >
        <input type="hidden" name="courseId" value={courseId} />
        <Input name="title" placeholder="New module title" aria-label="New module title" className="h-9 min-w-56 flex-1" required minLength={2} />
        <Button type="submit" size="sm"><Plus className="size-3.5" aria-hidden />Add module</Button>
      </form>

      <LessonEditor lesson={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
