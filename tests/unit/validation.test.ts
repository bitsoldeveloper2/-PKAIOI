import { describe, expect, it } from "vitest";
import { applicationSchema, fieldErrors, formToObject, loginSchema, passwordSchema, registerSchema } from "@/lib/validation";
import { safeNextPath, slugify, truncate } from "@/lib/utils";

describe("password policy", () => {
  it("requires length, a letter and a number", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("onlylettersherex").success).toBe(false);
    expect(passwordSchema.safeParse("Campus!2026").success).toBe(true);
  });
});

describe("login and register schemas", () => {
  it("normalises email and rejects empty passwords", () => {
    const parsed = loginSchema.safeParse({ email: "  Student@PIOAI.edu.pk ", password: "x" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("student@pioai.edu.pk");
    expect(loginSchema.safeParse({ email: "student@pioai.edu.pk", password: "" }).success).toBe(false);
  });

  it("flattens errors per field", () => {
    const parsed = registerSchema.safeParse({ name: "A", email: "nope", password: "weak" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error);
      expect(Object.keys(errors).sort()).toEqual(["email", "name", "password"]);
    }
  });
});

describe("application schema", () => {
  const valid = {
    programId: "p1",
    firstName: "Sarah",
    lastName: "Ahmed",
    email: "sarah@example.com",
    phone: "+92 321 5550101",
    country: "Pakistan",
    city: "Lahore",
    education: "BSc Computer Science",
    experience: "Three years as a backend engineer building fraud rules.",
    statement: "I have watched fraud rules fail in ways a model would have caught, and I want to be the person who builds and validates that model properly. ".repeat(2),
    consent: "on",
  };
  it("accepts a complete application and treats an empty LinkedIn URL as absent", () => {
    const parsed = applicationSchema.safeParse({ ...valid, linkedinUrl: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.linkedinUrl).toBeUndefined();
  });
  it("requires consent and a substantive statement", () => {
    expect(applicationSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...valid, statement: "Too short." }).success).toBe(false);
  });
});

describe("form helpers", () => {
  it("converts FormData including repeated keys", () => {
    const fd = new FormData();
    fd.set("lessonId", "l1");
    fd.append("answers[]", "0");
    fd.append("answers[]", "2");
    expect(formToObject(fd)).toEqual({ lessonId: "l1", answers: ["0", "2"] });
  });
});

describe("utils", () => {
  it("only allows same-origin relative redirects", () => {
    expect(safeNextPath("/campus/courses")).toBe("/campus/courses");
    expect(safeNextPath("//evil.example")).toBe("/campus");
    expect(safeNextPath("https://evil.example")).toBe("/campus");
    expect(safeNextPath(undefined, "/studio")).toBe("/studio");
  });
  it("slugifies and truncates", () => {
    expect(slugify("LLM Engineering & Evaluation!")).toBe("llm-engineering-evaluation");
    expect(truncate("a".repeat(200), 50).length).toBeLessThanOrEqual(51);
  });
});
