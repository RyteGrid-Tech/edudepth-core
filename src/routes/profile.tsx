import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  listCourses,
  listEnrollments,
  listProgress,
  listQuizResults,
  type Course,
} from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Account Configuration — EduDepth" }] }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [stats, setStats] = useState({ lessons: 0, quizzes: 0, avg: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      listCourses(),
      listEnrollments(user.id),
      listProgress(user.id),
      listQuizResults(user.id),
    ]).then(([c, e, p, r]) => {
      setEnrolled(c.filter((x) => e.includes(x.id)));
      const avg = r.length
        ? Math.round(r.reduce((a, x) => a + (x.score / x.total) * 100, 0) / r.length)
        : 0;
      setStats({ lessons: p.filter((x) => x.completed).length, quizzes: r.length, avg });
    });
  }, [user]);

  async function endSession() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-4xl mx-auto">
        <p className="font-mono text-xs text-text-muted">
          edudepth@profile:~$ <span className="text-accent">cat ~/.config</span>
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
          Account Configuration
        </h1>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          <Field l="OPERATOR ID" v={user?.id ?? "—"} mono />
          <Field l="FULL NAME" v={profile?.full_name ?? "—"} />
          <Field l="EMAIL ADDRESS" v={profile?.email ?? "—"} mono />
          <Field l="CLASS LEVEL" v={profile?.class_level ?? "—"} />
        </div>

        <span className="label-mono text-accent mt-10 inline-block">// LIFETIME METRICS</span>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          <Stat l="MODULES" v={String(enrolled.length).padStart(2, "0")} />
          <Stat l="LESSONS CLEARED" v={String(stats.lessons).padStart(3, "0")} />
          <Stat l="ASSESSMENTS RUN" v={String(stats.quizzes).padStart(3, "0")} />
          <Stat l="AVG SCORE" v={stats.quizzes ? `${stats.avg}%` : "—"} accent />
        </div>

        <span className="label-mono text-accent mt-10 inline-block">// DEPLOYED MODULES</span>
        {enrolled.length === 0 ? (
          <p className="font-mono text-xs text-text-muted mt-3">No modules deployed yet.</p>
        ) : (
          <div className="mt-3 space-y-px bg-border">
            {enrolled.map((m) => (
              <Link
                key={m.code}
                to="/course/$courseCode"
                params={{ courseCode: m.code }}
                className="bg-bg-card p-4 flex items-center justify-between hover:bg-bg-surface transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-accent">{m.code}</span>
                  <span className="text-text-primary">{m.title}</span>
                </div>
                <span className="label-mono text-text-muted">OPEN →</span>
              </Link>
            ))}
          </div>
        )}

        {profile?.is_admin && (
          <div className="mt-10 border-l-2 border-warning bg-bg-surface p-5">
            <span className="label-mono text-warning">// ADMIN PRIVILEGE DETECTED</span>
            <p className="text-text-secondary text-sm mt-2">You have control panel access.</p>
            <Link
              to="/admin"
              className="inline-block label-mono border border-warning text-warning px-4 py-2 mt-4 hover:bg-warning hover:text-white transition-colors"
            >
              OPEN CONTROL PANEL →
            </Link>
          </div>
        )}

        <div className="mt-10 border-l-2 border-danger bg-bg-surface p-5">
          <span className="label-mono text-danger">// DANGER ZONE</span>
          <p className="text-text-secondary text-sm mt-2">
            Ending session terminates your authenticated state.
          </p>
          <button
            onClick={endSession}
            className="label-mono border border-danger text-danger px-5 py-2.5 mt-4 hover:bg-danger hover:text-white transition-colors"
          >
            END SESSION →
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ l, v, mono }: { l: string; v: string; mono?: boolean }) {
  return (
    <div className="bg-bg-card p-4">
      <p className="label-mono text-text-muted">{l}</p>
      <p
        className={`mt-1.5 ${mono ? "font-mono text-sm break-all" : "text-base"} text-text-primary`}
      >
        {v}
      </p>
    </div>
  );
}

function Stat({ l, v, accent }: { l: string; v: string; accent?: boolean }) {
  return (
    <div className={`bg-bg-card p-4 ${accent ? "border-l-2 border-accent" : ""}`}>
      <div className="font-mono text-2xl font-bold">{v}</div>
      <div className="label-mono text-text-muted mt-1">{l}</div>
    </div>
  );
}
