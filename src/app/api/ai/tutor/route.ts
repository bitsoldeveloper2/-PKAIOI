import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/dal";
import { can } from "@/server/auth/permissions";
import { clientIp, LIMITS, rateLimit } from "@/server/rate-limit";
import { isSameOrigin } from "@/lib/csrf";
import { truncate } from "@/lib/utils";
import { buildSystemBlocks, getAnthropic, loadLessonContext, streamReply } from "@/server/ai/tutor";

export const maxDuration = 120;

const bodySchema = z.object({
  conversationId: z.string().min(1).max(64).optional(),
  message: z.string().trim().min(1, "Write a message first.").max(6000, "Keep messages under 6,000 characters."),
  courseId: z.string().max(64).optional(),
  lessonId: z.string().max(64).optional(),
  labCode: z.string().max(20_000).optional(),
  mode: z.enum(["tutor", "lab"]).default("tutor"),
});

const encoder = new TextEncoder();
const sse = (event: string, data: unknown) => encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

/** Streams a tutor reply as server-sent events and persists both turns. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "ai:use")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const anthropic = getAnthropic();
  if (!anthropic) return NextResponse.json({ error: "ai_unavailable", message: "AI features are not configured on this deployment." }, { status: 503 });

  const limit = rateLimit(`ai:${user.id}`, LIMITS.ai);
  if (!limit.ok) return NextResponse.json({ error: "rate_limited", message: `You have reached the tutor limit for now. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? (error.issues[0]?.message ?? "Invalid request.") : "Invalid request.";
    return NextResponse.json({ error: "invalid", message }, { status: 400 });
  }

  const context = await loadLessonContext(user.id, body.lessonId, body.courseId);

  let conversation = body.conversationId
    ? await db.conversation.findFirst({ where: { id: body.conversationId, userId: user.id }, select: { id: true, title: true } })
    : null;
  if (body.conversationId && !conversation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  conversation ??= await db.conversation.create({
    data: {
      userId: user.id,
      title: truncate(body.message.replace(/\s+/g, " "), 72),
      mode: body.mode,
      courseId: context?.courseId ?? null,
      lessonId: context?.lessonId ?? null,
    },
    select: { id: true, title: true },
  });

  const history = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 40,
    select: { role: true, content: true },
  });

  await db.message.create({ data: { conversationId: conversation.id, role: "USER", content: body.message } });

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role === "USER" ? ("user" as const) : ("assistant" as const), content: m.content })),
    { role: "user", content: body.message },
  ];

  const system = buildSystemBlocks({
    learnerName: user.name,
    courseTitle: context?.courseTitle,
    lessonTitle: context?.lessonTitle,
    lessonType: context?.lessonType,
    lessonContent: context?.lessonContent,
    labBrief: context?.labBrief ?? null,
    labCode: body.labCode,
  });

  const conversationId = conversation.id;
  const ip = await clientIp();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sse("meta", { conversationId, title: conversation.title }));
      let text = "";
      try {
        const reply = streamReply(anthropic, { system, messages });
        reply.on("text", (delta) => {
          text += delta;
          controller.enqueue(sse("delta", { text: delta }));
        });
        const final = await reply.finalMessage();
        if (final.stop_reason === "refusal") {
          const note = "\n\n_I can’t help with that request. If it is about coursework, try rephrasing; for anything else, contact the registrar._";
          text += note;
          controller.enqueue(sse("delta", { text: note }));
        }
        await db.message.create({
          data: {
            conversationId,
            role: "ASSISTANT",
            content: text,
            inputTokens: final.usage.input_tokens + (final.usage.cache_read_input_tokens ?? 0) + (final.usage.cache_creation_input_tokens ?? 0),
            outputTokens: final.usage.output_tokens,
          },
        });
        await db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
        controller.enqueue(sse("done", { conversationId, outputTokens: final.usage.output_tokens }));
      } catch (error) {
        let message = "The tutor could not respond right now. Please try again.";
        if (error instanceof Anthropic.RateLimitError) message = "The tutor is busy at the moment. Please try again in a minute.";
        else if (error instanceof Anthropic.AuthenticationError) message = "The AI service is misconfigured on this deployment.";
        else if (error instanceof Anthropic.APIError) message = `The AI service returned an error (${error.status}).`;
        console.error("[ai/tutor]", { ip, userId: user.id, error });
        if (text) {
          await db.message.create({ data: { conversationId, role: "ASSISTANT", content: text } }).catch(() => undefined);
        }
        controller.enqueue(sse("error", { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
