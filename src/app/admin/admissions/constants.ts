import type { ApplicationStatus } from "@/generated/prisma/enums";

export const STATUSES: ApplicationStatus[] = ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "OFFER", "ACCEPTED", "WAITLISTED", "REJECTED", "WITHDRAWN"];

export const STATUS_TONE: Record<ApplicationStatus, "neutral" | "info" | "warning" | "gold" | "success" | "outline" | "danger"> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "info",
  INTERVIEW: "warning",
  OFFER: "gold",
  ACCEPTED: "success",
  WAITLISTED: "outline",
  REJECTED: "danger",
  WITHDRAWN: "outline",
};

export const statusLabel = (s: string) => s.replace(/_/g, " ").toLowerCase();
