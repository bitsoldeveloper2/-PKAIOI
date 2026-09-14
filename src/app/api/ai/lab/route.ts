import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/dal";
import { can } from "@/server/auth/permissions";
import { LIMITS, rateLimit } from "@/server/rate-limit";
import { isSameOrigin } from "@/lib/csrf";
import { getAnthropic, TUTOR_MODEL, TUTOR_SYSTEM } from "@/server/ai/tutor";

export const maxDuration = 90;

const bodySchema = z.object({
  language: z.enum(["python", "javascript"]),
  code: z.string().max(20_000),
  brief: z.string().max(8000).optional(),
  mode: z.enum(["hint", "review", "explain-error"]).default("review"),
  output: z.string().max(4000).optional(),
  failing: z.array(z.object({ name: z.string().max(200), output: z.string().max(1000) })).max(20).optional(),
});

const MODE_INSTRUCTIONS = {
  hint: "Give ONE hint that moves the learner forward without writing the solution. At most four sentences. End with a question that checks whether they see the next step.",
  review:
    "Review the code like a kind senior engineer: correctness first, then clarity, then style. Point at specific lines. Do not rewrite the whole solution; show at most a three-line snippet if a concrete change needs illustrating. Finish with the single most valuable improvement.",
  "explain-error":
    "Explain what the error or failing test means in plain language, why the learner's code produces it, and what to check. Do not write the corrected solution.",
} as const;

/** One-shot code hint / review / error explanation for the coding lab. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "ai:use")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const anthropic = getAnthropic();
  if (!anthropic) return NextResponse.json({ error: "ai_unavailable", message: "AI features are not configured on this deployment." }, { status: 503 });

  const limit = rateLimit(`ai:${user.id}`, LIMITS.ai);
  if (!limit.ok) return NextResponse.json({ error: "rate_limited", message: "You have reached the AI limit for now. Try again shortly." }, { status: 429 });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const userContent = [
    body.brief ? `<lab_brief>\n${body.brief}\n</lab_brief>` : null,
    `<learner_code language="${body.language}">\n${body.code || "(empty)"}\n</learner_code>`,
    body.output ? `<program_output>\n${body.output}\n</program_output>` : null,
    body.failing?.length ? `<failing_tests>\n${body.failing.map((f) => `- ${f.name}: ${f.output}`).join("\n")}\n</failing_tests>` : null,
    `Task: ${MODE_INSTRUCTIONS[body.mode]}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await anthropic.messages.create({
      model: TUTOR_MODEL,
      max_tokens: 1500,
      system: [
        { type: "text", text: TUTOR_SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: `Learner: ${user.name}. You are assisting inside the coding lab.` },
      ],
      messages: [{ role: "user", content: userContent }],
      thinking: { type: "adaptive" },
      output_config: { effort: body.mode === "hint" ? "low" : "medium" },
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (response.stop_reason === "refusal" || !text) {
      return NextResponse.json({ text: "I can’t help with that particular request. If it is about the lab, try asking for a hint on a specific test." });
    }
    return NextResponse.json({ text });
  } catch (error) {
    let message = "The AI reviewer could not respond right now.";
    if (error instanceof Anthropic.RateLimitError) message = "The AI reviewer is busy. Try again in a minute.";
    else if (error instanceof Anthropic.APIError) message = `The AI service returned an error (${error.status}).`;
    console.error("[ai/lab]", error);
    return NextResponse.json({ error: "upstream", message }, { status: 502 });
  }
}
