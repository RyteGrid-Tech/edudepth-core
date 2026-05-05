import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MOCK_USER, MOCK_MODULES } from "@/lib/mockData";

export const Route = createFileRoute("/console")({
  head: () => ({ meta: [{ title: "Student Console — EduDepth" }] }),
  component: ConsolePage,
});

function ConsolePage() {
  const enrolled = MOCK_MODULES.filter((m) => m.enrolled);
  const lessonsCleared = 47;
  const avgScore = 82;
  const streak = 12;
  const lastSession = "2026-05-04 21:14:08 WAT";

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
        {/* greeting */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-text-muted">
              edudepth@console:~$ <span className="text-accent">whoami</span>
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
              Operator <span className="text-accent">{MOCK_USER.name.split(" ")[0]}</span>.
            </h1>
            <p className="text-text-secondary mt-1">Resume your operation. Three modules active.</p>
          </div>
          <div className="border-l-2 border-success bg-bg-surface px-4 py-2.5">
            <p className="font-mono text-xs text-success">● SYSTEM: ONLINE</p>
            <p className="font-mono text-[10px] text-text-muted mt-0.5">LAST: {lastSession}</p>
          </div>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-10">
          <Metric label="ACTIVE MODULES" value={String(enrolled.length).padStart(2, "0")} />
          <Metric label="LESSONS CLEARED" value={String(lessonsCleared).padStart(3, "0")} />
          <Metric label="AVG QUIZ SCORE" value={`${avgScore}%`} accent />
          <Metric label="DAY STREAK" value={String(streak).padStart(2, "0")} />
        </div>

        {/* split: resume + progress */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-border mb-10">
          <div className="lg:col-span-3 bg-bg-card p-6">
            <span className="label-mono text-accent">// RESUME OPERATION</span>
            <h2 className="text-xl font-bold mt-2">Indices & Logarithms</h2>
            <p className="font-mono text-xs text-text-muted mt-1">
              MTH101 · MODULE 1 · LESSON 3 · 18:22
            </p>
            <div className="mt-4 border-l-2 border-accent bg-bg-surface p-3">
              <p className="text-sm text-text-secondary">
                You stopped at <span className="font-mono text-text-primary">07:42</span>. 10 minutes remaining to clear.
              </p>
            </div>
            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: "l3" }}
              className="inline-block label-mono bg-accent text-bg-primary px-5 py-3 mt-5 font-bold hover:bg-accent-dim transition-colors"
            >
              RESUME LESSON →
            </Link>
          </div>
          <div className="lg:col-span-2 bg-bg-card p-6">
            <span id="progress" className="label-mono text-accent">// SYSTEM PROGRESS</span>
            <div className="mt-4 space-y-4">
              {enrolled.map((m) => (
                <div key={m.code}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-text-primary">{m.code}</span>
                    <span className="font-mono text-xs text-text-secondary">{m.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-surface">
                    <div className="h-full bg-accent" style={{ width: `${m.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* enrolled modules */}
        <div className="flex items-end justify-between mb-5">
          <span className="label-mono text-accent">// DEPLOYED MODULES</span>
          <Link to="/catalog" className="label-mono text-text-secondary hover:text-accent transition-colors">
            DEPLOY NEW →
          </Link>
        </div>
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
                <span className="label-mono text-text-muted border border-border px-2 py-0.5">{m.level}</span>
              </div>
              <h3 className="text-lg font-bold mt-2">{m.title}</h3>
              <p className="font-mono text-[11px] text-text-muted mt-1">
                {m.lessons} LESSONS · {m.quizzes} ASSESSMENTS
              </p>
              <div className="h-1 bg-bg-surface mt-4">
                <div className="h-full bg-accent" style={{ width: `${m.progress}%` }} />
              </div>
              <p className="font-mono text-xs text-text-secondary mt-2">{m.progress}% CLEARED</p>
            </Link>
          ))}
        </div>
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
