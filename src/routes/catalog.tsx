import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MOCK_MODULES } from "@/lib/mockData";

export const Route = createFileRoute("/catalog")({
  head: () => ({ meta: [{ title: "Module Catalog — EduDepth" }] }),
  component: CatalogPage,
});

const LEVELS = ["ALL", "SS1", "SS2", "SS3", "JAMB"];
const STATUSES = ["ALL", "ENROLLED", "AVAILABLE"];

function CatalogPage() {
  const [level, setLevel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");

  const filtered = MOCK_MODULES.filter((m) => {
    if (level !== "ALL" && m.level !== level) return false;
    if (status === "ENROLLED" && !m.enrolled) return false;
    if (status === "AVAILABLE" && m.enrolled) return false;
    if (query && !m.title.toLowerCase().includes(query.toLowerCase()) && !m.code.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
        <p className="font-mono text-xs text-text-muted">edudepth@catalog:~$ <span className="text-accent">ls --modules</span></p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Module Catalog</h1>
        <p className="text-text-secondary mt-1">Deploy modules to your operation. Filter by level or status.</p>

        {/* filter bar */}
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
            {filtered.map((m) => (
              <div key={m.code} className="bg-bg-card p-5 group hover:bg-bg-surface transition-colors border-l-2 border-transparent hover:border-accent">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs text-accent">{m.code}</span>
                  <span className="label-mono text-text-muted border border-border px-2 py-0.5">{m.level}</span>
                </div>
                <h3 className="text-lg font-bold">{m.title}</h3>
                <div className="grid grid-cols-3 gap-px bg-border mt-4 mb-4">
                  <Stat n={m.modules} l="MODS" />
                  <Stat n={m.lessons} l="LESSONS" />
                  <Stat n={m.quizzes} l="QUIZ" />
                </div>
                <p className="font-mono text-[11px] text-text-muted mb-4">
                  {m.students.toLocaleString()} OPERATORS ENROLLED
                </p>
                {m.enrolled ? (
                  <Link
                    to="/course/$courseCode"
                    params={{ courseCode: m.code }}
                    className="block label-mono text-center bg-bg-surface text-accent border border-accent py-2.5 hover:bg-accent hover:text-bg-primary transition-colors"
                  >
                    OPEN MODULE →
                  </Link>
                ) : (
                  <button
                    onClick={() => {/* TODO: connect to Supabase — insert into enrollments */}}
                    className="block w-full label-mono bg-accent text-white py-2.5 font-bold hover:bg-accent-dim transition-colors"
                  >
                    DEPLOY MODULE →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="bg-bg-card py-2 text-center">
      <div className="font-mono text-base font-bold">{n}</div>
      <div className="label-mono text-text-muted text-[9px]">{l}</div>
    </div>
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
