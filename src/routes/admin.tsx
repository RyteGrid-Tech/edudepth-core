import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MOCK_USER } from "@/lib/mockData";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Control Panel — EduDepth" }] }),
  // TODO: connect to Supabase — beforeLoad: check profiles.is_admin === true
  component: AdminPage,
});

const SECTIONS = ["COURSE", "MODULE", "LESSON", "ASSESSMENT"] as const;
type Section = typeof SECTIONS[number];

function AdminPage() {
  const [section, setSection] = useState<Section>("COURSE");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // TODO: connect to Supabase — verify admin role, redirect non-admins
  if (!MOCK_USER.is_admin) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-md mx-auto">
          <div className="border-l-2 border-danger bg-bg-surface p-5">
            <p className="label-mono text-danger">ACCESS DENIED</p>
            <p className="text-text-secondary text-sm mt-2 font-mono">Credentials not recognised. Admin role required.</p>
            <Link to="/console" className="inline-block label-mono text-accent mt-4">RETURN TO CONSOLE →</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: connect to Supabase — insert into respective table
    const messages: Record<Section, string> = {
      COURSE: "Course deployed.",
      MODULE: "Module deployed.",
      LESSON: "Lesson registered.",
      ASSESSMENT: "Assessment created.",
    };
    setConfirmation(messages[section]);
    setTimeout(() => setConfirmation(null), 4000);
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-5xl mx-auto">
        <p className="font-mono text-xs text-text-muted">edudepth@admin:~$ <span className="text-accent">sudo control</span></p>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Control Panel</h1>
          <span className="label-mono border border-warning text-warning px-3 py-1.5">PRIVILEGED</span>
        </div>

        {confirmation && (
          <div className="border-l-2 border-success bg-bg-surface p-4 mt-6">
            <p className="font-mono text-sm text-success">● {confirmation}</p>
          </div>
        )}

        {/* section tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mt-6">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setSection(s); setConfirmation(null); }}
              className={`label-mono py-3 transition-colors ${
                section === s ? "bg-bg-card text-accent border-l-2 border-accent" : "bg-bg-surface text-text-muted hover:text-text-primary"
              }`}
            >
              CREATE {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-px space-y-px bg-border">
          {section === "COURSE" && (
            <>
              <Field label="COURSE CODE" placeholder="MTH101" />
              <Field label="TITLE" placeholder="Mathematics" />
              <Field label="CLASS LEVEL" placeholder="SS3" />
              <TextArea label="DESCRIPTION" placeholder="Curriculum-aligned mathematics for WAEC and JAMB..." />
            </>
          )}
          {section === "MODULE" && (
            <>
              <Field label="PARENT COURSE CODE" placeholder="MTH101" />
              <Field label="MODULE TITLE" placeholder="Algebraic Processes" />
              <Field label="ORDER INDEX" placeholder="2" mono />
            </>
          )}
          {section === "LESSON" && (
            <>
              <Field label="PARENT MODULE ID" placeholder="m_abc123" mono />
              <Field label="LESSON TITLE" placeholder="Quadratic Equations" />
              <Field label="YOUTUBE URL" placeholder="https://youtube.com/watch?v=..." mono />
              <Field label="DURATION" placeholder="22:16" mono />
              <TextArea label="LESSON NOTES" placeholder="Key concepts, formulas, examples..." />
            </>
          )}
          {section === "ASSESSMENT" && (
            <>
              <Field label="PARENT LESSON ID" placeholder="l_xyz789" mono />
              <Field label="TOPIC LABEL" placeholder="Quadratic Equations" />
              <TextArea label="QUESTIONS (JSON)" placeholder='[{"q":"...","options":["A","B","C","D"],"correct":1}]' mono />
            </>
          )}
          <button type="submit" className="w-full label-mono bg-accent text-white py-4 font-bold hover:bg-accent-dim transition-colors mt-px">
            DEPLOY {section} →
          </button>
        </form>

        <p className="font-mono text-xs text-text-muted mt-6">
          // ALL WRITES PERSIST TO SUPABASE. NO UNDO. VERIFY BEFORE DEPLOY.
        </p>
      </div>
    </AppShell>
  );
}

function Field({ label, placeholder, mono }: { label: string; placeholder?: string; mono?: boolean }) {
  return (
    <div className="bg-bg-card">
      <label className="label-mono text-text-muted block px-4 pt-3">{label}</label>
      <input
        required
        placeholder={placeholder}
        className={`w-full bg-bg-card px-4 py-3 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent ${mono ? "font-mono text-sm" : ""}`}
      />
    </div>
  );
}

function TextArea({ label, placeholder, mono }: { label: string; placeholder?: string; mono?: boolean }) {
  return (
    <div className="bg-bg-card">
      <label className="label-mono text-text-muted block px-4 pt-3">{label}</label>
      <textarea
        required
        rows={5}
        placeholder={placeholder}
        className={`w-full bg-bg-card px-4 py-3 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent resize-none ${mono ? "font-mono text-sm" : ""}`}
      />
    </div>
  );
}
