"use server";

import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { clientIp, LIMITS, rateLimit } from "@/server/rate-limit";
import { contactSchema, enterpriseInquirySchema, fieldErrors, formToObject, subscribeSchema } from "@/lib/validation";

export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

async function limited(scope: string): Promise<ActionState | null> {
  const ip = await clientIp();
  const result = rateLimit(`${scope}:${ip}`, LIMITS.contact);
  if (!result.ok) {
    return { ok: false, message: `Too many submissions. Please try again in about ${Math.ceil(result.retryAfterSec / 60)} minute(s).` };
  }
  return null;
}

/** Newsletter / interest capture from the footer and journal. Creates a CRM lead. */
export async function subscribeAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const blocked = await limited("subscribe");
  if (blocked) return blocked;

  const parsed = subscribeSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { email, interest } = parsed.data;
  const existing = await db.lead.findFirst({ where: { email }, select: { id: true } });
  if (!existing) {
    const lead = await db.lead.create({
      data: { name: email.split("@")[0] ?? "Subscriber", email, source: "Newsletter", interest: interest ?? "Journal" },
    });
    await audit({ action: "lead.subscribe", entity: "Lead", entityId: lead.id, meta: { source: "Newsletter" } });
  }
  return { ok: true, message: "You’re on the list. We send one considered letter a month." };
}

/** General contact form → CRM lead with the message as the first activity. */
export async function contactAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const blocked = await limited("contact");
  if (blocked) return blocked;

  const parsed = contactSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { name, email, organization, interest, message } = parsed.data;
  const lead = await db.lead.create({
    data: {
      name,
      email,
      organization: organization || null,
      source: "Contact form",
      interest,
      message,
      activities: { create: { type: "NOTE", body: `Contact form message:\n\n${message}` } },
    },
  });
  await audit({ action: "lead.contact", entity: "Lead", entityId: lead.id, meta: { interest } });
  return { ok: true, message: "Thank you. A member of the institute will reply within two working days." };
}

/** Enterprise partnership inquiry → qualified CRM lead. */
export async function enterpriseInquiryAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const blocked = await limited("enterprise");
  if (blocked) return blocked;

  const parsed = enterpriseInquirySchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { name, email, organization, role, teamSize, message } = parsed.data;
  const lead = await db.lead.create({
    data: {
      name,
      email,
      organization,
      role: role || null,
      source: "Enterprise inquiry",
      interest: `Enterprise · ${teamSize} learners`,
      stage: "QUALIFIED",
      message: message || null,
      activities: {
        create: { type: "NOTE", body: `Enterprise inquiry for a team of ${teamSize}.${message ? `\n\n${message}` : ""}` },
      },
    },
  });
  await audit({ action: "lead.enterprise", entity: "Lead", entityId: lead.id, meta: { teamSize } });
  return { ok: true, message: "Thanks — our partnerships team will be in touch within one working day." };
}
