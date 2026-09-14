"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { updateLessonAction, type ActionState } from "@/server/actions/studio";
import type { LabSpec, QuizQuestion } from "@/server/queries/campus";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Markdown } from "@/components/markdown";
import { CodeEditor } from "@/components/code-editor";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
export type EditableLesson = {
  id: string;
  title: string;
  type: "VIDEO" | "ARTICLE" | "QUIZ" | "LAB";
  durationMinutes: number;
  content: string;
  videoUrl: string | null;
  quiz: QuizQuestion[];
  lab: LabSpec | null;
  isPreview: boolean;
};

const EMPTY_QUESTION = (): QuizQuestion => ({ id: `q${Date.now().toString(36)}`, prompt: "", options: ["", ""], answer: 0, explanation: "" });
const EMPTY_LAB = (): LabSpec => ({ language: "python", starterCode: "def solve():\n    raise NotImplementedError\n", hint: "", tests: [{ name: "solve is defined", code: "assert callable(solve)" }] });

function QuizBuilder({ questions, onChange }: { questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }) {
  const update = (i: number, patch: Partial<QuizQuestion>) => onChange(questions.map((q, qi) => (qi === i ? { ...q, ...patch } : q)));
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <fieldset key={q.id} className="rounded-lg border border-line p-4">
          <legend className="px-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">Question {i + 1}</legend>
          <label className="block text-sm font-medium text-ink" htmlFor={`${q.id}-prompt`}>Prompt</label>
          <Textarea id={`${q.id}-prompt`} value={q.prompt} onChange={(e) => update(i, { prompt: e.target.value })} rows={2} className="mt-1 min-h-0" />
          <p className="mt-3 text-sm font-medium text-ink">Options <span className="font-normal text-ink-muted">(select the correct one)</span></p>
          <div className="mt-1 space-y-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input type="radio" name={`${q.id}-answer`} checked={q.answer === oi} onChange={() => update(i, { answer: oi })} aria-label={`Option ${oi + 1} is correct`} className="accent-[var(--accent)]" />
                <Input value={opt} onChange={(e) => update(i, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })} aria-label={`Option ${oi + 1}`} className="h-9" />
                <button type="button" onClick={() => update(i, { options: q.options.filter((_, k) => k !== oi), answer: Math.min(q.answer, Math.max(0, q.options.length - 2)) })} disabled={q.options.length <= 2} className="rounded p-1.5 text-ink-subtle hover:bg-danger-soft hover:text-danger disabled:opacity-40" aria-label="Remove option">
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => update(i, { options: [...q.options, ""] })} disabled={q.options.length >= 6}><Plus className="size-3.5" aria-hidden />Option</Button>
            <Button size="sm" variant="ghost" onClick={() => onChange(questions.filter((_, k) => k !== i))} disabled={questions.length <= 1} className="text-danger"><Trash2 className="size-3.5" aria-hidden />Remove question</Button>
          </div>
          <label className="mt-3 block text-sm font-medium text-ink" htmlFor={`${q.id}-exp`}>Explanation shown after answering</label>
          <Textarea id={`${q.id}-exp`} value={q.explanation ?? ""} onChange={(e) => update(i, { explanation: e.target.value })} rows={2} className="mt-1 min-h-0" />
        </fieldset>
      ))}
      <Button variant="outline" onClick={() => onChange([...questions, EMPTY_QUESTION()])}><Plus className="size-4" aria-hidden />Add question</Button>
    </div>
  );
}

function LabBuilder({ lab, onChange }: { lab: LabSpec; onChange: (l: LabSpec) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Language
          <Select value={lab.language} onChange={(e) => onChange({ ...lab, language: e.target.value as LabSpec["language"] })} className="mt-1">
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </Select>
        </label>
        <label className="block text-sm font-medium text-ink">
          Instructor hint <span className="font-normal text-ink-muted">(the tutor may paraphrase it)</span>
          <Input value={lab.hint ?? ""} onChange={(e) => onChange({ ...lab, hint: e.target.value })} className="mt-1" />
        </label>
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Starter code</p>
        <CodeEditor value={lab.starterCode} onChange={(v) => onChange({ ...lab, starterCode: v })} language={lab.language} className="mt-1" minHeight="10rem" ariaLabel="Starter code" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Tests <span className="font-normal text-ink-muted">— each snippet runs after the learner’s code; a raised error fails it</span></p>
        <div className="mt-2 space-y-3">
          {lab.tests.map((t, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <div className="flex items-center gap-2">
                <Input value={t.name} onChange={(e) => onChange({ ...lab, tests: lab.tests.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} aria-label={`Test ${i + 1} name`} placeholder="Test name shown to learners" className="h-9" />
                <button type="button" onClick={() => onChange({ ...lab, tests: lab.tests.filter((_, k) => k !== i) })} disabled={lab.tests.length <= 1} className="rounded p-1.5 text-ink-subtle hover:bg-danger-soft hover:text-danger disabled:opacity-40" aria-label="Remove test"><Trash2 className="size-3.5" aria-hidden /></button>
              </div>
              <CodeEditor value={t.code} onChange={(v) => onChange({ ...lab, tests: lab.tests.map((x, k) => (k === i ? { ...x, code: v } : x)) })} language={lab.language} className="mt-2" minHeight="5rem" ariaLabel={`Test ${i + 1} code`} />
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-2" onClick={() => onChange({ ...lab, tests: [...lab.tests, { name: "", code: "" }] })}><Plus className="size-4" aria-hidden />Add test</Button>
      </div>
    </div>
  );
}

export function LessonEditor({ lesson, onClose }: { lesson: EditableLesson | null; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(updateLessonAction, undefined);
  const [type, setType] = useState<EditableLesson["type"]>("ARTICLE");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [lab, setLab] = useState<LabSpec>(EMPTY_LAB());
  const router = useRouter();
  const { toast } = useToast();

  const [lastLesson, setLastLesson] = useState<EditableLesson | null>(null);
  if (lesson !== lastLesson) {
    setLastLesson(lesson);
    if (lesson) {
      setType(lesson.type);
      setContent(lesson.content);
      setQuiz(lesson.quiz.length ? lesson.quiz : [EMPTY_QUESTION()]);
      setLab(lesson.lab ?? EMPTY_LAB());
      setPreview(false);
    }
  }

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast({ title: state.message ?? "Saved", variant: "success" });
      router.refresh();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!lesson) return null;
  const errors = state?.errors ?? {};

  return (
    <Dialog open={Boolean(lesson)} onClose={onClose} title={`Edit lesson`} description={lesson.title} size="xl" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" form="lesson-editor-form" loading={pending}>Save lesson</Button>
      </>
    }>
      <ActionForm id="lesson-editor-form" action={action} className="space-y-6" noValidate>
        <input type="hidden" name="lessonId" value={lesson.id} />
        <input type="hidden" name="content" value={content} />
        {type === "QUIZ" ? <input type="hidden" name="quiz" value={JSON.stringify({ questions: quiz })} /> : null}
        {type === "LAB" ? <input type="hidden" name="lab" value={JSON.stringify(lab)} /> : null}
        {state?.message && !state.ok ? <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{state.message}</p> : null}

        <div className="grid gap-5 sm:grid-cols-[1fr_10rem_8rem]">
          <Field label="Title" error={errors.title} required>{(b) => <Input {...b} name="title" defaultValue={lesson.title} />}</Field>
          <Field label="Type" error={errors.type} required>
            {(b) => (
              <Select {...b} name="type" value={type} onChange={(e) => setType(e.target.value as EditableLesson["type"])}>
                <option value="ARTICLE">Reading</option>
                <option value="VIDEO">Lecture video</option>
                <option value="QUIZ">Quiz</option>
                <option value="LAB">Coding lab</option>
              </Select>
            )}
          </Field>
          <Field label="Minutes" error={errors.durationMinutes} required>{(b) => <Input {...b} name="durationMinutes" type="number" min={1} max={600} defaultValue={lesson.durationMinutes} />}</Field>
        </div>

        {type === "VIDEO" ? (
          <Field label="Video URL" error={errors.videoUrl} hint="A path under /media/ or an https:// URL to an MP4/WebM file.">{(b) => <Input {...b} name="videoUrl" defaultValue={lesson.videoUrl ?? "/media/sample-lecture.webm"} />}</Field>
        ) : null}

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">{type === "LAB" ? "Lab brief" : type === "QUIZ" ? "Introduction" : type === "VIDEO" ? "Lecture notes / transcript" : "Content"} <span className="font-normal text-ink-muted">(Markdown)</span></p>
            <div role="group" aria-label="Editor mode" className="flex rounded-md border border-line p-0.5 text-xs">
              <button type="button" onClick={() => setPreview(false)} aria-pressed={!preview} className={cn("rounded px-2 py-1", !preview ? "bg-ink text-bg" : "text-ink-muted")}>Write</button>
              <button type="button" onClick={() => setPreview(true)} aria-pressed={preview} className={cn("rounded px-2 py-1", preview ? "bg-ink text-bg" : "text-ink-muted")}>Preview</button>
            </div>
          </div>
          {preview ? (
            <div className="mt-2 min-h-40 rounded-lg border border-line bg-surface-2 p-4"><Markdown content={content || "_Nothing to preview yet._"} /></div>
          ) : (
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="mt-2 font-mono text-[0.8125rem]" aria-label="Lesson content in Markdown" />
          )}
        </div>

        {type === "QUIZ" ? <QuizBuilder questions={quiz} onChange={setQuiz} /> : null}
        {type === "LAB" ? <LabBuilder lab={lab} onChange={setLab} /> : null}

        <Checkbox name="isPreview" defaultChecked={lesson.isPreview} label="Preview lesson — visible to anyone with an account, even before enrolling" />
      </ActionForm>
    </Dialog>
  );
}
