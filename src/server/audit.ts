import "server-only";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { clientIp } from "@/server/rate-limit";

export type AuditInput = {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
};

/** Append-only audit trail. Never throws — auditing must not break the primary action. */
export async function audit(input: AuditInput) {
  try {
    const ip = await clientIp().catch(() => null);
    await db.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        meta: (input.meta as Prisma.InputJsonValue | undefined) ?? undefined,
        ip,
      },
    });
  } catch (error) {
    console.error("[audit] failed to write entry", input.action, error);
  }
}
