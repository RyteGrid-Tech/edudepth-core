import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { enroll, listCourses, listEnrollments, type Course } from "@/lib/api";

export const Route = createFileRoute("/catalog")({
  head: () => ({ meta: [{ title: "Module Catalog — EduDepth" }] }),
  component: () => (
    <RequireAuth>
      <CatalogPage />
    </RequireAuth>
  ),
});

const LEVELS = ["ALL", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3", "Post-secondary"];
const STATUSES = ["ALL", "ENROLLED", "AVAILABLE"];

function CatalogPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [level, setLevel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listCourses().then(setCourses);
    listEnrollments(user.id).then(setEnrolledIds);
  }, [user]);

  async function handleEnroll(courseId: string) {
    if (!user) return;
    setBusyId(courseId);
    try {
      await enroll(user.id, courseId);
      setEnrolledIds((ids) => [...ids, courseId]);
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    return courses.filter((m) => {
      const isEnrolled = enrolledIds.includes(m.id);
      if (level !== "ALL" && !(m.class_levels ?? []).includes(level)) return false;
      if (status === "ENROLLED" && !isEnrolled) return false;
      if (status === "AVAILABLE" && isEnrolled) return false;
      if (
        query &&
        !m.title.toLowerCase().includes(query.toLowerCase()) &&
        !m.code.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [courses, enrolledIds, level, status, query]);

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
        <p className="font-mono text-xs text-text-muted">edudepth@catalog:~$ <span className="text-accent">ls --modules</span></p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Module Catalog</h1>
        <p className="text-text-secondary mt-1">Deploy modules to your operation. Filter by level or status.</p>

        <div className="mt-8 border border-border bg-bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            <FilterGroup label="LEVEL" options={LEVELS} value={level} onChange={setLevel} />
            <FilterGroup label="STATUS" options={STATUSES} value={status} onChange={setStatus} />
            <div className="bg-bg-card p-3">
              <p className="label-mono text-text-muted mb-2">SEARCH</p>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="MTH101 or 'Mathematics'"
                className="w-full bg-bg-surface px-3 py-2 font-mono text-sm text-text-primary outline-none border border-border focus:border-accent"
              />
            </div>
          </div>
        </div>

        <p className="font-mono text-xs text-text-muted mt-4">
          {String(filtered.length).padStart(2, "0")} MODULE(S) MATCHED
        </p>

        {filtered.length === 0 ? (
          <div className="border-l-2 border-warning bg-bg-surface p-6 mt-4">
            <p className="label-mono text-warning mb-1">EMPTY RESULT</p>
            <p className="text-sm text-text-secondary">No modules match your filters. Reset and retry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border mt-4">
            {filtered.map((m) => {
              const isEnrolled = enrolledIds.includes(m.id);
              return (
                <div key={m.code} className="bg-bg-card p-5 group hover:bg-bg-surface transition-colors border-l-2 border-transparent hover:border-accent">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-accent">{m.code}</span>
                    {m.class_levels?.[0] && (
                      <span className="label-mono text-text-muted border border-border px-2 py-0.5">{m.class_levels[0]}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{m.title}</h3>
                  <p className="font-mono text-[11px] text-text-muted mt-2 mb-4 line-clamp-3">{m.description}</p>
                  {isEnrolled ? (
                    <Link
                      to="/course/$courseCode"
                      params={{ courseCode: m.code }}
                      className="block label-mono text-center bg-bg-surface text-accent border border-accent py-2.5 hover:bg-accent hover:text-white transition-colors"
                    >
                      OPEN MODULE →
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(m.id)}
                      disabled={busyId === m.id}
                      className="block w-full label-mono bg-accent text-white py-2.5 font-bold hover:bg-accent-dim transition-colors disabled:opacity-50"
                    >
                      {busyId === m.id ? "DEPLOYING..." : "DEPLOY MODULE →"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-bg-card p-3">
      <p className="label-mono text-text-muted mb-2">{label}</p>
      <div className="flex flex-wrap gap-px bg-border">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`label-mono px-3 py-1.5 transition-colors ${
              value === o ? "bg-accent text-white" : "bg-bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
