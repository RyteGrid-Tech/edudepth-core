import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MOCK_COURSE } from "@/lib/mockData";

export const Route = createFileRoute("/course/$courseCode")({
  head: () => ({ meta: [{ title: "Course Architecture — EduDepth" }] }),
  component: CoursePage,
});

function CoursePage() {
  const { courseCode } = Route.useParams();
  // TODO: connect to Supabase — fetch course by code
  const c = MOCK_COURSE;

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-5xl mx-auto">
        {/* breadcrumb */}
        <p className="font-mono text-xs text-text-muted mb-6">
          <Link to="/catalog" className="hover:text-accent">CATALOG</Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-accent">{courseCode}</span>
        </p>

        {/* course header */}
        <div className="border-l-2 border-accent bg-bg-card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono text-xs text-accent">{c.code}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">{c.title}</h1>
            </div>
            <span className="label-mono text-text-muted border border-border px-3 py-1.5">{c.level}</span>
          </div>
          <p className="text-text-secondary mt-3 max-w-2xl leading-relaxed">{c.description}</p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            <Stat l="PROGRESS" v={`${c.progress}%`} accent />
            <Stat l="MODULES" v={String(c.modules.length)} />
            <Stat l="LESSONS" v={String(c.modules.reduce((a, m) => a + m.lessons.length, 0))} />
            <Stat l="OPERATORS" v={c.enrolled.toLocaleString()} />
          </div>

          <div className="h-1 bg-bg-surface mt-5">
            <div className="h-full bg-accent" style={{ width: `${c.progress}%` }} />
          </div>
        </div>

        {/* modules tree */}
        <div className="mt-8">
          <span className="label-mono text-accent">// MODULE STRUCTURE</span>
          <div className="mt-4 space-y-px bg-border">
            {c.modules.map((m, i) => (
              <details key={m.id} open={i === 0} className="bg-bg-card group">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-bg-surface transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-text-muted">M{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-lg font-bold">{m.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-text-secondary">{m.lessons.length} LESSONS</span>
                    <span className="label-mono text-accent group-open:rotate-90 transition-transform">▸</span>
                  </div>
                </summary>
                <div className="border-t border-border">
                  {m.lessons.map((l, j) => {
                    const locked = (l as { locked?: boolean }).locked;
                    const cleared = l.status === "CLEARED";
                    const inProgress = l.status === "IN PROGRESS";
                    const Wrap = ({ children }: { children: React.ReactNode }) =>
                      locked ? <div className="opacity-50 cursor-not-allowed">{children}</div> : (
                        <Link to="/lesson/$lessonId" params={{ lessonId: l.id }} className="block hover:bg-bg-surface transition-colors">{children}</Link>
                      );
                    return (
                      <Wrap key={l.id}>
                        <div className={`flex items-center justify-between px-5 py-3.5 border-b border-border last:border-b-0 ${
                          cleared ? "border-l-2 border-l-success" : inProgress ? "border-l-2 border-l-accent" : ""
                        }`}>
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="font-mono text-xs text-text-muted shrink-0">L{String(j + 1).padStart(2, "0")}</span>
                            <span className="text-sm truncate">{l.title}</span>
                            {locked && <span className="label-mono text-text-muted shrink-0">LOCKED</span>}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="font-mono text-xs text-text-muted">{l.duration}</span>
                            <span className={`label-mono ${
                              cleared ? "text-success" : inProgress ? "text-accent" : "text-text-muted"
                            }`}>
                              {l.status}
                            </span>
                          </div>
                        </div>
                      </Wrap>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ l, v, accent }: { l: string; v: string; accent?: boolean }) {
  return (
    <div className={`bg-bg-card p-3 ${accent ? "border-l-2 border-accent" : ""}`}>
      <div className="font-mono text-xl font-bold">{v}</div>
      <div className="label-mono text-text-muted text-[10px] mt-1">{l}</div>
    </div>
  );
}
