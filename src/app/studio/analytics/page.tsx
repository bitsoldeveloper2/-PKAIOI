import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/dal";
import { getStudioAnalytics } from "@/server/queries/studio";
import { PageHeader } from "@/components/ui/section-heading";
import { BarChart, ChartFrame, HBars } from "@/components/charts/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Analytics" };

export default async function StudioAnalyticsPage() {
  const user = await requirePermission("studio:access", "/studio/analytics");
  const data = await getStudioAnalytics(user);
  const weekLabels = data.weeks.map((w) => w.label);
  const scoreLabels = ["< 60%", "60–69%", "70–79%", "80–89%", "90–100%"];

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Studio" title="Analytics" lede="Enrolments and lesson completions over the last twelve weeks, quiz performance, and where learners drop off." />

      {data.courses.length === 0 ? (
        <EmptyState className="mt-10" icon={BarChart3} title="No data yet" description="Analytics appear once learners enrol on a published course." />
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <ChartFrame
            title="Enrolments and completions"
            description="Per week, last twelve weeks. Completions count lessons finished."
            labels={weekLabels}
            series={[
              { name: "Enrolments", values: data.weeks.map((w) => w.enrollments) },
              { name: "Lessons completed", values: data.weeks.map((w) => w.completions) },
            ]}
            className="lg:col-span-2"
          >
            <BarChart
              labels={weekLabels}
              series={[
                { name: "Enrolments", values: data.weeks.map((w) => w.enrollments) },
                { name: "Lessons completed", values: data.weeks.map((w) => w.completions) },
              ]}
              height={220}
            />
          </ChartFrame>

          <ChartFrame title="Quiz score distribution" description={`${data.quizAttempts} attempts across your courses. 70% is the pass mark.`} labels={scoreLabels} series={[{ name: "Attempts", values: data.scoreBins }]}>
            <HBars labels={scoreLabels} values={data.scoreBins} tone={1} />
          </ChartFrame>

          {data.funnels.map((f, fi) => (
            <ChartFrame
              key={f.courseId}
              title={f.title}
              description={`${f.learners} learners · lesson-by-lesson completion. A steep drop marks where learners stall.`}
              labels={f.lessons.map((l) => l.title)}
              series={[{ name: "Completed", values: f.lessons.map((l) => l.completed) }]}
            >
              <HBars labels={f.lessons.map((l) => l.title)} values={f.lessons.map((l) => l.completed)} max={Math.max(1, f.learners)} tone={(fi + 2) % 5} />
            </ChartFrame>
          ))}
        </div>
      )}
    </div>
  );
}
