import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { requireUser } from "@/server/auth/dal";
import { listMyEnrollments } from "@/server/queries/campus";
import { EnrollmentCard } from "@/components/app/enrollment-card";
import { PageHeader } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "My courses" };

export default async function MyCoursesPage() {
  const user = await requireUser("/campus/courses");
  const enrollments = await listMyEnrollments(user.id);
  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader
        eyebrow="Campus"
        title="My courses"
        lede="Everything you are enrolled on, with your next lesson one click away."
        actions={<ButtonLink href="/courses" variant="outline">Browse the catalog</ButtonLink>}
      />

      {enrollments.length === 0 ? (
        <EmptyState className="mt-10" icon={BookOpen} title="You are not enrolled on any course yet" description="Choose a course from the catalog — enrolment is free for campus members." action={<ButtonLink href="/courses">Browse courses</ButtonLink>} />
      ) : (
        <div className="mt-10 space-y-12">
          <section aria-labelledby="active-title">
            <h2 id="active-title" className="eyebrow">In progress · {active.length}</h2>
            {active.length ? (
              <div className="mt-4 grid gap-4">
                {active.map((e) => (
                  <EnrollmentCard key={e.id} enrollment={e} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">Nothing in progress. Start something new from the catalog.</p>
            )}
          </section>
          {completed.length ? (
            <section aria-labelledby="completed-title">
              <h2 id="completed-title" className="eyebrow">Completed · {completed.length}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {completed.map((e) => (
                  <EnrollmentCard key={e.id} enrollment={e} compact />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
