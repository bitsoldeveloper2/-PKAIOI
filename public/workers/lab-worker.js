/*
 * PIOAI coding-lab worker. Runs learner code off the main thread.
 *  - JavaScript: evaluated in this worker's global scope (no DOM, no network helpers).
 *  - Python: Pyodide, self-hosted under /pyodide/ (loaded on first use).
 * Protocol: { type: "run", id, language, code, tests } → status | stdout | stderr | test | done | error
 */
/* global loadPyodide, importScripts */
"use strict";

let pyodide = null;
let pyodideLoading = null;

const post = (msg) => self.postMessage(msg);

// Network helpers are hidden while learner JavaScript runs (Pyodide needs fetch to load itself).
const NETWORK_GLOBALS = ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts"];
function withNetworkHidden(fn) {
  const saved = NETWORK_GLOBALS.map((n) => [n, self[n]]);
  for (const n of NETWORK_GLOBALS) {
    try { self[n] = undefined; } catch { /* non-writable */ }
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [n, v] of saved) {
        try { self[n] = v; } catch { /* non-writable */ }
      }
    });
}

async function ensurePyodide(id) {
  if (pyodide) return pyodide;
  if (!pyodideLoading) {
    post({ type: "status", id, phase: "loading-runtime" });
    pyodideLoading = (async () => {
      const load = await import("/pyodide/pyodide.mjs");
      const py = await load.loadPyodide({ indexURL: "/pyodide/" });
      return py;
    })();
  }
  pyodide = await pyodideLoading;
  return pyodide;
}

function makeConsole(id) {
  const fmt = (args) =>
    args
      .map((a) => {
        if (typeof a === "string") return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ");
  return {
    log: (...a) => post({ type: "stdout", id, text: fmt(a) + "\n" }),
    info: (...a) => post({ type: "stdout", id, text: fmt(a) + "\n" }),
    warn: (...a) => post({ type: "stderr", id, text: fmt(a) + "\n" }),
    error: (...a) => post({ type: "stderr", id, text: fmt(a) + "\n" }),
  };
}

async function runJavaScript(id, code, tests) {
  return withNetworkHidden(() => runJavaScriptInner(id, code, tests));
}

async function runJavaScriptInner(id, code, tests) {
  self.console = makeConsole(id);
  post({ type: "status", id, phase: "running" });
  try {
    // Indirect eval → top-level declarations become worker globals, so tests can call them.
    (0, eval)(code);
  } catch (err) {
    post({ type: "stderr", id, text: String(err && err.stack ? err.stack : err) + "\n" });
    post({ type: "done", id, ok: false });
    return;
  }
  let ok = tests.length > 0;
  if (tests.length) post({ type: "status", id, phase: "testing" });
  for (const t of tests) {
    try {
      const result = (0, eval)(t.code);
      if (result && typeof result.then === "function") await result;
      post({ type: "test", id, name: t.name, passed: true, output: "" });
    } catch (err) {
      ok = false;
      post({ type: "test", id, name: t.name, passed: false, output: String(err && err.message ? err.message : err) });
    }
  }
  post({ type: "done", id, ok });
}

async function runPython(id, code, tests) {
  let py;
  try {
    py = await ensurePyodide(id);
  } catch (err) {
    post({ type: "error", id, message: "The Python runtime could not be loaded: " + String(err) });
    return;
  }
  py.setStdout({ batched: (s) => post({ type: "stdout", id, text: s + "\n" }) });
  py.setStderr({ batched: (s) => post({ type: "stderr", id, text: s + "\n" }) });
  post({ type: "status", id, phase: "running" });
  // Fresh globals per run so earlier attempts cannot leak into tests.
  const globals = py.globals.get("dict")();
  try {
    await py.runPythonAsync(code, { globals });
  } catch (err) {
    post({ type: "stderr", id, text: String(err && err.message ? err.message : err) + "\n" });
    post({ type: "done", id, ok: false });
    globals.destroy();
    return;
  }
  let ok = tests.length > 0;
  if (tests.length) post({ type: "status", id, phase: "testing" });
  for (const t of tests) {
    try {
      await py.runPythonAsync(t.code, { globals });
      post({ type: "test", id, name: t.name, passed: true, output: "" });
    } catch (err) {
      ok = false;
      const message = String(err && err.message ? err.message : err);
      const last = message.trim().split("\n").pop() || message;
      post({ type: "test", id, name: t.name, passed: false, output: last });
    }
  }
  globals.destroy();
  post({ type: "done", id, ok });
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.type === "warmup") {
    try {
      await ensurePyodide(msg.id || "warmup");
      post({ type: "status", id: msg.id || "warmup", phase: "ready" });
    } catch (err) {
      post({ type: "error", id: msg.id || "warmup", message: String(err) });
    }
    return;
  }
  if (msg.type !== "run") return;
  const { id, language, code = "", tests = [] } = msg;
  const started = Date.now();
  try {
    if (language === "python") await runPython(id, code, tests);
    else await runJavaScript(id, code, tests);
  } catch (err) {
    post({ type: "error", id, message: String(err) });
  }
  post({ type: "timing", id, durationMs: Date.now() - started });
};
