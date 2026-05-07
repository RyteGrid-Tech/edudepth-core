import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { listCourses, listEnrollments, listProgress, listQuizResults, type Course } from "@/lib/api";

export const Route = createFileRoute("/console")({
  head: () => ({ meta: [{ title: "Student Console — EduDepth" }] }),
  component: () => (
    <RequireAuth>
      <ConsolePage />
    </RequireAuth>
  ),
});

function ConsolePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [lessonsCleared, setLessonsCleared] = useState(0);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      listCourses(),
      listEnrollments(user.id),
      listProgress(user.id),
      listQuizResults(user.id),
    ])
      .then(([c, e, p, r]) => {
        setCourses(c);
        setEnrolledIds(e);
        setLessonsCleared(p.filter((x) => x.completed).length);
        if (r.length) {
          const avg = r.reduce((a, x) => a + (x.score / x.total) * 100, 0) / r.length;
          setAvgScore(Math.round(avg));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const enrolled = courses.filter((c) => enrolledIds.includes(c.id));
  const firstName = profile?.full_name?.split(" ")[0] ?? "Operator";

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-text-muted">
              edudepth@console:~$ <span className="text-accent">whoami</span>
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
              Operator <span className="text-accent">{firstName}</span>.
            </h1>
            <p className="text-text-secondary mt-1">
              {loading ? "Initializing system..." : `${enrolled.length} module(s) active.`}
            </p>
          </div>
          <div className="border-l-2 border-success bg-bg-surface px-4 py-2.5">
            <p className="font-mono text-xs text-success">● SYSTEM: ONLINE</p>
            <p className="font-mono text-[10px] text-text-muted mt-0.5">{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-10">
          <Metric label="ACTIVE MODULES" value={String(enrolled.length).padStart(2, "0")} />
          <Metric label="LESSONS CLEARED" value={String(lessonsCleared).padStart(3, "0")} />
          <Metric label="AVG QUIZ SCORE" value={avgScore !== null ? `${avgScore}%` : "—"} accent />
          <Metric label="CLASS LEVEL" value={profile?.class_level ?? "—"} />
        </div>

        <div className="flex items-end justify-between mb-5">
          <span className="label-mono text-accent">// DEPLOYED MODULES</span>
          <Link to="/catalog" className="label-mono text-text-secondary hover:text-accent transition-colors">
            DEPLOY NEW →
          </Link>
        </div>

        {enrolled.length === 0 ? (
          <div className="border-l-2 border-warning bg-bg-surface p-6">
            <p className="label-mono text-warning mb-1">NO MODULES DEPLOYED</p>
            <p className="text-sm text-text-secondary mb-4">Deploy your first module from the catalog.</p>
            <button
              onClick={() => navigate({ to: "/catalog" })}
              className="label-mono bg-accent text-white px-5 py-2.5 font-bold hover:bg-accent-dim transition-colors"
            >
              OPEN CATALOG →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {enrolled.map((m) => (
              <Link
                key={m.code}
                to="/course/$courseCode"
                params={{ courseCode: m.code }}
                className="bg-bg-card p-5 hover:bg-bg-surface transition-colors border-l-2 border-transparent hover:border-accent block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-accent">{m.code}</span>
                  {m.class_levels?.[0] && (
                    <span className="label-mono text-text-muted border border-border px-2 py-0.5">{m.class_levels[0]}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold mt-2">{m.title}</h3>
                <p className="font-mono text-[11px] text-text-muted mt-1 line-clamp-2">{m.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`bg-bg-card p-5 ${accent ? "border-l-2 border-accent" : ""}`}>
      <div className="font-mono text-2xl md:text-3xl font-bold text-text-primary">{value}</div>
      <div className="label-mono text-text-muted mt-1.5">{label}</div>
    </div>
  );
}
