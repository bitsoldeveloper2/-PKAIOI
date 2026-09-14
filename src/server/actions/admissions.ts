"use server";

import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getCurrentUser } from "@/server/auth/dal";
import { clientIp, LIMITS, rateLimit } from "@/server/rate-limit";
import { applicationSchema, fieldErrors, formToObject } from "@/lib/validation";
import type { ActionState } from "./leads";

export type ApplyState = ActionState & { reference?: string };

/** Public admissions application. Creates the application, a timeline event and a CRM lead. */
export async function applyAction(_prev: ApplyState | undefined, formData: FormData): Promise<ApplyState> {
  const ip = await clientIp();
  const limit = rateLimit(`apply:${ip}`, LIMITS.contact);
  if (!limit.ok) return { ok: false, message: "Too many submissions from this network. Please try again later." };

  const parsed = applicationSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please check the highlighted fields." };

  const data = parsed.data;
  const program = await db.program.findFirst({ where: { id: data.programId, published: true }, select: { id: true, title: true } });
  if (!program) return { ok: false, errors: { programId: ["Choose a program."] } };

  const user = await getCurrentUser();
  const duplicate = await db.application.findFirst({
    where: { email: data.email, programId: program.id, status: { in: ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "OFFER"] } },
    select: { id: true },
  });
  if (duplicate) {
    return { ok: false, message: "You already have an open application for this program. Admissions will be in touch — write to admissions@pioai.edu.pk if you need to update it." };
  }

  const application = await db.application.create({
    data: {
      programId: program.id,
      applicantId: user?.id ?? null,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      city: data.city,
      education: data.education,
      experience: data.experience,
      statement: data.statement,
      linkedinUrl: data.linkedinUrl ?? null,
      events: { create: { type: "SUBMITTED", body: "Application submitted through the website.", actorId: user?.id ?? null } },
    },
    select: { id: true },
  });

  const existingLead = await db.lead.findFirst({ where: { email: data.email }, select: { id: true } });
  if (!existingLead) {
    await db.lead.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        source: "Application",
        interest: program.title,
        stage: "QUALIFIED",
      },
    });
  }

  await audit({ actorId: user?.id ?? null, action: "admissions.apply", entity: "Application", entityId: application.id, meta: { program: program.title } });

  return {
    ok: true,
    reference: application.id.slice(-8).toUpperCase(),
    message: `Thank you, ${data.firstName}. Your application to ${program.title} has been received. Admissions will reply within ten working days.`,
  };
}
