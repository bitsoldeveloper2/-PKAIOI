"use client";

/**
 * Client-side bridge to the coding-lab web worker (public/workers/lab-worker.js).
 * One worker per runner; a run that exceeds the timeout terminates the worker
 * and a fresh one is created for the next run.
 */

export type LabLanguage = "python" | "javascript";
export type LabTest = { name: string; code: string };
export type LabTestResult = { name: string; passed: boolean; output: string };
export type LabPhase = "idle" | "loading-runtime" | "running" | "testing" | "done" | "error";

export type LabRunCallbacks = {
  onPhase?: (phase: LabPhase) => void;
  onStdout?: (text: string) => void;
  onStderr?: (text: string) => void;
  onTest?: (result: LabTestResult) => void;
  onDone?: (result: { ok: boolean; durationMs: number; tests: LabTestResult[] }) => void;
  onError?: (message: string) => void;
};

type WorkerMessage =
  | { type: "status"; id: string; phase: string }
  | { type: "stdout"; id: string; text: string }
  | { type: "stderr"; id: string; text: string }
  | { type: "test"; id: string; name: string; passed: boolean; output: string }
  | { type: "done"; id: string; ok: boolean }
  | { type: "timing"; id: string; durationMs: number }
  | { type: "error"; id: string; message: string };

const WORKER_URL = "/workers/lab-worker.js";

export class LabRunner {
  private worker: Worker | null = null;
  private active: { id: string; callbacks: LabRunCallbacks; tests: LabTestResult[]; timer: ReturnType<typeof setTimeout>; started: number } | null = null;
  private counter = 0;

  private ensureWorker() {
    if (this.worker) return this.worker;
    const worker = new Worker(WORKER_URL);
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => this.handle(event.data);
    worker.onerror = (event) => {
      const message = event.message || "The lab runtime crashed.";
      this.finishWithError(message);
    };
    this.worker = worker;
    return worker;
  }

  /** Preload the Python runtime so the first run is fast. */
  warmup() {
    try {
      this.ensureWorker().postMessage({ type: "warmup", id: "warmup" });
    } catch {
      /* ignore — the run will surface the error */
    }
  }

  run(language: LabLanguage, code: string, tests: LabTest[], callbacks: LabRunCallbacks, timeoutMs = language === "python" ? 90_000 : 15_000) {
    this.cancel();
    const id = `run-${++this.counter}`;
    const worker = this.ensureWorker();
    const timer = setTimeout(() => {
      this.terminate();
      callbacks.onError?.(`Stopped after ${Math.round(timeoutMs / 1000)}s — check for an infinite loop.`);
      callbacks.onPhase?.("error");
      this.active = null;
    }, timeoutMs);
    this.active = { id, callbacks, tests: [], timer, started: Date.now() };
    callbacks.onPhase?.(language === "python" ? "loading-runtime" : "running");
    worker.postMessage({ type: "run", id, language, code, tests });
  }

  cancel() {
    if (!this.active) return;
    clearTimeout(this.active.timer);
    this.active = null;
    this.terminate();
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
  }

  private finishWithError(message: string) {
    const active = this.active;
    if (!active) return;
    clearTimeout(active.timer);
    this.active = null;
    active.callbacks.onError?.(message);
    active.callbacks.onPhase?.("error");
  }

  private handle(msg: WorkerMessage) {
    const active = this.active;
    if (!active || msg.id !== active.id) return;
    const { callbacks } = active;
    switch (msg.type) {
      case "status":
        if (msg.phase === "loading-runtime" || msg.phase === "running" || msg.phase === "testing") callbacks.onPhase?.(msg.phase);
        break;
      case "stdout":
        callbacks.onStdout?.(msg.text);
        break;
      case "stderr":
        callbacks.onStderr?.(msg.text);
        break;
      case "test": {
        const result = { name: msg.name, passed: msg.passed, output: msg.output };
        active.tests.push(result);
        callbacks.onTest?.(result);
        break;
      }
      case "done":
        clearTimeout(active.timer);
        this.active = null;
        callbacks.onPhase?.("done");
        callbacks.onDone?.({ ok: msg.ok, durationMs: Date.now() - active.started, tests: active.tests });
        break;
      case "error":
        this.finishWithError(msg.message);
        break;
      default:
        break;
    }
  }
}
