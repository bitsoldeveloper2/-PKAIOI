import { describe, expect, it } from "vitest";
import { can, homeFor, PERMISSIONS } from "@/server/auth/permissions";

describe("role permissions", () => {
  it("students can learn but cannot operate", () => {
    expect(can("STUDENT", "campus:access")).toBe(true);
    expect(can("STUDENT", "ai:use")).toBe(true);
    expect(can("STUDENT", "studio:access")).toBe(false);
    expect(can("STUDENT", "admin:access")).toBe(false);
  });

  it("instructors get the studio, staff get the console, admins get everything", () => {
    expect(can("INSTRUCTOR", "studio:access")).toBe(true);
    expect(can("INSTRUCTOR", "admin:access")).toBe(false);
    expect(can("STAFF", "admin:access")).toBe(true);
    expect(can("STAFF", "admin:users")).toBe(false);
    expect(can("STAFF", "audit:read")).toBe(false);
    for (const permission of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
      expect(can("ADMIN", permission)).toBe(true);
    }
  });

  it("routes each role to its workspace after sign-in", () => {
    expect(homeFor("STUDENT")).toBe("/campus");
    expect(homeFor("INSTRUCTOR")).toBe("/studio");
    expect(homeFor("STAFF")).toBe("/admin");
    expect(homeFor("ADMIN")).toBe("/admin");
  });
});
