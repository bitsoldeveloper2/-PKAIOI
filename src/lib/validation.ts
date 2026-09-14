import { z } from "zod";

/** Shared Zod schemas. Server actions parse with these; client forms may reuse for hints. */

const trimmed = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, min > 1 ? `Please enter at least ${min} characters.` : "This field is required.")
    .max(max, `Please keep this under ${max} characters.`);

export const emailSchema = z
  .string({ error: "Enter a valid email address." })
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ error: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(10, { error: "Use at least 10 characters." })
  .max(128, { error: "Passwords are limited to 128 characters." })
  .refine((v) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v), {
    error: "Include at least one letter and one number.",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }).max(128),
  next: z.string().optional(),
});

export const registerSchema = z.object({
  name: trimmed(80, 2).refine((v) => v.split(/\s+/).length >= 1, { error: "Enter your name." }),
  email: emailSchema,
  password: passwordSchema,
  inviteCode: z.string().trim().max(32).optional(),
});

export const subscribeSchema = z.object({
  email: emailSchema,
  interest: z.string().trim().max(80).optional(),
});

export const contactSchema = z.object({
  name: trimmed(80, 2),
  email: emailSchema,
  organization: z.string().trim().max(120).optional(),
  interest: z.enum(["program", "course", "enterprise", "research", "media", "other"]),
  message: trimmed(2000, 10),
});

export const enterpriseInquirySchema = z.object({
  name: trimmed(80, 2),
  email: emailSchema,
  organization: trimmed(120, 2),
  role: z.string().trim().max(80).optional(),
  teamSize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  message: z.string().trim().max(2000).optional(),
});

export const applicationSchema = z.object({
  programId: z.string().min(1, { error: "Choose a program." }),
  firstName: trimmed(60, 1),
  lastName: trimmed(60, 1),
  email: emailSchema,
  phone: trimmed(30, 6),
  country: trimmed(60, 2),
  city: trimmed(60, 2),
  education: trimmed(120, 2),
  experience: trimmed(1200, 10),
  statement: trimmed(3000, 100),
  linkedinUrl: z
    .union([z.literal(""), z.url({ error: "Enter a full URL, including https://." })])
    .optional()
    .transform((v) => (v ? v : undefined)),
  consent: z.literal("on", { error: "Please confirm you agree to the admissions terms." }),
});

export const noteSchema = z.object({
  lessonId: z.string().min(1),
  body: z.string().max(10_000),
});

export const quizSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  answers: z.array(z.number().int().min(0).max(9)).max(50),
});

export const labSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  language: z.enum(["python", "javascript"]),
  code: z.string().max(50_000),
  results: z
    .array(z.object({ name: z.string().max(200), passed: z.boolean(), output: z.string().max(2000) }))
    .max(50),
});

export const profileSchema = z.object({
  name: trimmed(80, 2),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  timezone: z.string().trim().max(60).optional(),
});

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password.").max(128),
    password: passwordSchema,
    confirm: z.string().max(128),
  })
  .refine((v) => v.password === v.confirm, { error: "Passwords do not match.", path: ["confirm"] });

export type FieldErrors<T extends z.ZodType> = Partial<Record<keyof z.infer<T>, string[]>>;

/** Flattens a Zod error into `{ field: [messages] }`. */
export function fieldErrors<T extends z.ZodType>(error: z.ZodError<z.infer<T>>): FieldErrors<T> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    (out[key] ??= []).push(issue.message);
  }
  return out as FieldErrors<T>;
}

/** Converts FormData to a plain object, keeping repeated keys as arrays. */
export function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (key.endsWith("[]")) {
      const k = key.slice(0, -2);
      const existing = obj[k];
      if (Array.isArray(existing)) existing.push(value);
      else obj[k] = [value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
}
