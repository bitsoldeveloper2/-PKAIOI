"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { updateLeadStageAction } from "@/server/actions/admin";
import { useToast } from "@/components/ui/toast";
import { cn, firstName, formatPkr, relativeTime } from "@/lib/utils";

export type BoardLead = { id: string; name: string; organization: string | null; interest: string | null; source: string; stage: string; value: number | null; owner: string | null; activities: number; updatedAt: string };

const STAGES = [
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "PROPOSAL", label: "Proposal" },
  { id: "WON", label: "Won" },
  { id: "LOST", label: "Lost" },
] as const;

function Card({ lead }: { lead: BoardLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  return (
    <li ref={setNodeRef} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} className={cn("rounded-lg border border-line bg-surface p-3 shadow-soft", isDragging && "z-20 opacity-90 shadow-lift")}>
      <div className="flex items-start gap-2">
        <button type="button" className="mt-0.5 cursor-grab rounded p-0.5 text-ink-subtle hover:bg-surface-2 active:cursor-grabbing" aria-label={`Move ${lead.name}`} {...attributes} {...listeners}>
          <GripVertical className="size-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <Link href={`/admin/crm/${lead.id}` as Route} className="block truncate text-sm font-semibold text-ink hover:text-accent">{lead.name}</Link>
          <p className="truncate text-xs text-ink-muted">{lead.organization ?? "Individual"}{lead.interest ? ` · ${lead.interest}` : ""}</p>
          <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-ink-subtle">
            <span>{lead.value ? formatPkr(lead.value) : lead.source}</span>
            <span>{lead.owner ? firstName(lead.owner) : "—"} · {relativeTime(lead.updatedAt)}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

function Column({ stage, label, leads, total }: { stage: string; label: string; leads: BoardLead[]; total: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <section ref={setNodeRef} className={cn("flex min-h-[24rem] w-64 shrink-0 flex-col rounded-xl border border-line bg-bg-deep p-2 transition-colors", isOver && "border-accent bg-accent-soft/40")} aria-label={`${label} (${leads.length})`}>
      <header className="flex items-center justify-between px-2 py-1.5">
        <h3 className="text-[0.75rem] font-semibold uppercase tracking-wider text-ink-muted">{label}</h3>
        <span className="text-[0.75rem] tabular text-ink-subtle">{leads.length}{total ? ` · ${formatPkr(total)}` : ""}</span>
      </header>
      <ul className="flex flex-1 flex-col gap-2">
        {leads.map((l) => (
          <Card key={l.id} lead={l} />
        ))}
      </ul>
    </section>
  );
}

export function CrmBoard({ leads: initial }: { leads: BoardLead[] }) {
  const [leads, setLeads] = useState(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (lastInitial !== initial) {
    setLastInitial(initial);
    setLeads(initial);
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const stage = String(over.id);
    const lead = leads.find((l) => l.id === active.id);
    if (!lead || lead.stage === stage) return;
    setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, stage } : l)));
    startTransition(async () => {
      try {
        await updateLeadStageAction(lead.id, stage);
        toast({ title: `${lead.name} moved to ${stage.toLowerCase()}`, variant: "success" });
        router.refresh();
      } catch (err) {
        setLeads((list) => list.map((l) => (l.id === lead.id ? { ...l, stage: lead.stage } : l)));
        toast({ title: "Could not move lead", description: (err as Error).message, variant: "error" });
      }
    });
  };

  return (
    <div className="scroll-thin overflow-x-auto pb-3" aria-busy={pending}>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-3">
          {STAGES.map((s) => {
            const items = leads.filter((l) => l.stage === s.id);
            return <Column key={s.id} stage={s.id} label={s.label} leads={items} total={items.reduce((n, l) => n + (l.value ?? 0), 0)} />;
          })}
        </div>
      </DndContext>
      <p className="mt-2 text-xs text-ink-subtle">Keyboard users: open a lead and change its stage from the detail page.</p>
    </div>
  );
}
