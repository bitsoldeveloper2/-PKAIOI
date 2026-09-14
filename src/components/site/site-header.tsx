import { getCurrentUser } from "@/server/auth/dal";
import { homeFor } from "@/server/auth/permissions";
import { HeaderNav } from "./header-nav";

/** Public site header. Reads the session once so the nav can show the right call to action. */
export async function SiteHeader({ invert = false }: { invert?: boolean }) {
  const user = await getCurrentUser();
  return (
    <HeaderNav
      invert={invert}
      user={user ? { name: user.name, avatarUrl: user.avatarUrl, home: homeFor(user.role), role: user.role } : null}
    />
  );
}
