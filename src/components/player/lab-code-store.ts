"use client";

/**
 * Tiny shared store so the tutor panel can read the learner's current lab
 * code without the two components being coupled through props.
 */
let current = "";
const listeners = new Set<() => void>();

export const labCodeStore = {
  get: () => current,
  set: (code: string) => {
    current = code;
    listeners.forEach((l) => l());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
