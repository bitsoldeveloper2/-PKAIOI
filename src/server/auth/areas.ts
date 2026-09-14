import "server-only";
import { cache } from "react";
import { getEnterpriseContexts, type SessionUser } from "./dal";
import { can } from "./permissions";
import { AREA_META, type AreaKey } from "@/lib/app-nav";

export type AreaLink = { key: AreaKey; label: string; home: string; description: string };

/** Workspaces the user may switch between. Campus is always available. */
export const getAreasFor = cache(async (user: SessionUser): Promise<AreaLink[]> => {
  const keys: AreaKey[] = ["campus"];
  if (can(user.role, "studio:access")) keys.push("studio");
  if (can(user.role, "admin:access")) keys.push("admin");
  const contexts = await getEnterpriseContexts(user.id);
  if (contexts.length > 0 || can(user.role, "enterprise:manage")) keys.push("enterprise");
  return keys.map((key) => ({ key, ...AREA_META[key] }));
});
