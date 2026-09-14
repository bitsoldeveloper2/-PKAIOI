"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gauge } from "lucide-react";
import { completeLessonAction } from "@/server/actions/campus";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const RATES = [0.75, 1, 1.25, 1.5, 2];

/**
 * Native video with a branded poster, playback-rate control and automatic
 * completion when the lecture finishes. Keyboard: space/k play-pause, ←/→ seek.
 */
export function VideoPlayer({ src, title, lessonId, completed }: { src: string; title: string; lessonId: string; completed: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [rate, setRate] = useState(1);
  const [started, setStarted] = useState(false);
  const [pending, startTransition] = useTransition();
  const watched = useRef(0);
  const lastTick = useRef<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (video.current) video.current.playbackRate = rate;
  }, [rate]);

  const onTimeUpdate = () => {
    const v = video.current;
    if (!v || v.paused) return;
    const now = v.currentTime;
    if (lastTick.current !== null && now > lastTick.current && now - lastTick.current < 2) watched.current += now - lastTick.current;
    lastTick.current = now;
  };

  const onEnded = () => {
    if (completed) return;
    const form = new FormData();
    form.set("lessonId", lessonId);
    form.set("seconds", String(Math.round(watched.current)));
    startTransition(async () => {
      const result = await completeLessonAction(undefined, form);
      if (result.ok) {
        toast({ title: "Lecture complete", description: result.certificateCode ? "That was the last lesson — your certificate is ready." : "Progress saved.", variant: "success" });
        router.refresh();
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const v = video.current;
    if (!v || (e.target as HTMLElement).tagName === "BUTTON") return;
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      if (v.paused) void v.play();
      else v.pause();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      v.currentTime = Math.max(0, v.currentTime - 5);
    }
  };

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-[#0b0f13] shadow-lift" aria-busy={pending}>
      <div className="relative aspect-video" onKeyDown={onKeyDown}>
        <video
          ref={video}
          src={src}
          controls
          preload="metadata"
          playsInline
          onPlay={() => setStarted(true)}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          className="size-full bg-black"
          aria-label={`${title} — lecture video`}
        >
          Your browser does not support HTML video. <a href={src}>Download the lecture</a>.
        </video>
        {!started ? (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 p-5 text-white">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/70">Lecture</p>
            <p className="mt-1 font-display text-2xl">{title}</p>
          </div>
        ) : null}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[0.8125rem] text-white/70">
        <span className="inline-flex items-center gap-2">
          <Gauge className="size-3.5" aria-hidden />
          <span className="sr-only">Playback speed</span>
          <span role="group" aria-label="Playback speed" className="inline-flex gap-1">
            {RATES.map((r) => (
              <button key={r} type="button" onClick={() => setRate(r)} aria-pressed={rate === r} className={cn("rounded px-1.5 py-0.5 tabular transition-colors", rate === r ? "bg-white/15 text-white" : "hover:bg-white/10")}>
                {r}×
              </button>
            ))}
          </span>
        </span>
        <span>Space to play · ← → to seek 5s · completes automatically at the end</span>
      </figcaption>
    </figure>
  );
}
