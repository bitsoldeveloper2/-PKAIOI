import type { Role } from "@/generated/prisma/enums";

/**
 * Role → capability map. Roles are coarse (student / instructor / staff / admin);
 * enterprise managers are derived from organisation membership, not a role.
 */
export const PERMISSIONS = {
  "campus:access": ["STUDENT", "INSTRUCTOR", "STAFF", "ADMIN"],
  "ai:use": ["STUDENT", "INSTRUCTOR", "STAFF", "ADMIN"],
  "studio:access": ["INSTRUCTOR", "ADMIN"],
  "admin:access": ["STAFF", "ADMIN"],
  "admin:users": ["ADMIN"],
  "admin:settings": ["ADMIN"],
  "audit:read": ["ADMIN"],
  "cms:manage": ["STAFF", "ADMIN"],
  "crm:manage": ["STAFF", "ADMIN"],
  "admissions:manage": ["STAFF", "ADMIN"],
  "research:manage": ["STAFF", "ADMIN"],
  "enterprise:manage": ["STAFF", "ADMIN"],
  "academy:manage": ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  STAFF: "Staff",
  ADMIN: "Administrator",
};

export const ROLES: Role[] = ["STUDENT", "INSTRUCTOR", "STAFF", "ADMIN"];

/** Where a user lands after signing in. */
export function homeFor(role: Role): "/campus" | "/studio" | "/admin" {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/admin";
    case "INSTRUCTOR":
      return "/studio";
    default:
      return "/campus";
  }
}
