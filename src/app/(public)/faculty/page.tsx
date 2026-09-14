import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { listFaculty, listFacultyDepartments } from "@/server/queries/research";
import { FacultyCard } from "@/components/site/cards";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Faculty",
  description: "The professors, researchers and practitioners who teach and lead research at the Pakistan Institute of AI.",
  alternates: { canonical: "/faculty" },
};

export default async function FacultyPage({ searchParams }: { searchParams: Promise<{ department?: string }> }) {
  const { department } = await searchParams;
  const [faculty, departments] = await Promise.all([listFaculty({ department: department || undefined }), listFacultyDepartments()]);

  return (
    <div className="container-x py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Faculty</p>
        <h1 className="mt-4 font-display text-display-lg text-ink">Taught by people who still build.</h1>
        <p className="mt-4 text-[1.0625rem] text-ink-muted">
          Every instructor runs research, ships software, or advises the institutions that deploy it. Office hours are real and weekly.
        </p>
      </header>

      <nav aria-label="Departments" className="mt-10 flex flex-wrap gap-2 border-y border-line py-4">
        <Link href="/faculty" className={cn("rounded-full px-3 py-1 text-sm", !department ? "bg-ink text-bg" : "text-ink-muted hover:text-ink")}>
          All
        </Link>
        {departments.map((d) => (
          <Link
            key={d.department}
            href={`/faculty?department=${encodeURIComponent(d.department)}` as Route}
            className={cn("rounded-full px-3 py-1 text-sm", department === d.department ? "bg-ink text-bg" : "text-ink-muted hover:text-ink")}
          >
            {d.department} <span className="tabular opacity-60">{d.count}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {faculty.map((f) => (
          <FacultyCard key={f.id} member={f} />
        ))}
      </div>
    </div>
  );
}
