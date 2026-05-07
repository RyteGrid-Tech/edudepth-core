import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import {
  createCourse,
  createLesson,
  createModule,
  createQuizWithQuestions,
  getCourseIdByCode,
  listProfiles,
  toggleAdmin,
  type Profile,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Control Panel — EduDepth" }] }),
  component: () => (
    <RequireAuth admin>
      <AdminPage />
    </RequireAuth>
  ),
});

const SECTIONS = ["REGISTRY", "COURSE", "MODULE", "LESSON", "ASSESSMENT"] as const;
type Section = typeof SECTIONS[number];

function AdminPage() {
  const [section, setSection] = useState<Section>("REGISTRY");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // form state
  const [course, setCourse] = useState({ code: "", title: "", description: "", levels: "SS3" });
  const [mod, setMod] = useState({ courseCode: "", title: "", position: "1" });
  const [lesson, setLesson] = useState({ moduleId: "", title: "", video: "", notes: "", position: "1" });
  const [quiz, setQuiz] = useState({ lessonId: "", title: "", json: "" });

  useEffect(() => {
    if (section === "REGISTRY") {
      fetchProfiles();
    }
  }, [section]);

  async function fetchProfiles() {
    try {
      const data = await listProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    }
  }

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 4500);
  }

  async function handleToggleAdmin(pid: string, current: boolean) {
    try {
      await toggleAdmin(pid, !current);
      setProfiles(profiles.map((p) => (p.id === pid ? { ...p, is_admin: !current } : p)));
      flash(true, "Privileges updated.");
    } catch (err) {
      flash(false, "Failed to update role.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (section === "COURSE") {
        await createCourse({
          code: course.code.trim(),
          title: course.title.trim(),
          description: course.description.trim(),
          class_levels: course.levels.split(",").map((s) => s.trim()).filter(Boolean),
        });
        flash(true, `Course ${course.code} deployed.`);
        setCourse({ code: "", title: "", description: "", levels: "SS3" });
      } else if (section === "MODULE") {
        const courseId = await getCourseIdByCode(mod.courseCode.trim());
        if (!courseId) throw new Error("Parent course not found.");
        await createModule({ course_id: courseId, title: mod.title.trim(), position: Number(mod.position) });
        flash(true, "Module deployed.");
        setMod({ courseCode: "", title: "", position: "1" });
      } else if (section === "LESSON") {
        await createLesson({
          module_id: lesson.moduleId.trim(),
          title: lesson.title.trim(),
          video_url: lesson.video.trim(),
          notes_text: lesson.notes,
          position: Number(lesson.position),
        });
        flash(true, "Lesson registered.");
        setLesson({ moduleId: "", title: "", video: "", notes: "", position: "1" });
      } else if (section === "ASSESSMENT") {
        const parsed = JSON.parse(quiz.json) as Array<{
          q: string;
          options: [string, string, string, string];
          correct: 0 | 1 | 2 | 3;
        }>;
        const questions = parsed.map((q) => ({
          question_text: q.q,
          option_a: q.options[0],
          option_b: q.options[1],
          option_c: q.options[2],
          option_d: q.options[3],
          correct_option: (["a", "b", "c", "d"] as const)[q.correct],
        }));
        await createQuizWithQuestions(quiz.lessonId.trim(), quiz.title.trim() || "Assessment", questions);
        flash(true, `Assessment with ${questions.length} questions created.`);
        setQuiz({ lessonId: "", title: "", json: "" });
      }
    } catch (err) {
      flash(false, err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
        <p className="font-mono text-xs text-text-muted">edudepth@admin:~$ <span className="text-accent">sudo control</span></p>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Command Center</h1>
          <span className="label-mono border border-warning text-warning px-3 py-1.5">ROOT ACCESS</span>
        </div>

        {msg && (
          <div className={`border-l-2 ${msg.ok ? "border-success" : "border-danger"} bg-bg-surface p-4 mt-6`}>
            <p className={`font-mono text-sm ${msg.ok ? "text-success" : "text-danger"}`}>● {msg.text}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-border mt-6 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setSection(s); setMsg(null); }}
              className={`label-mono py-3 px-2 text-[10px] md:text-xs transition-colors text-center ${
                section === s ? "bg-bg-card text-accent border-l-2 border-accent" : "bg-bg-surface text-text-muted hover:text-text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-px">
          {section === "REGISTRY" && (
            <div className="bg-bg-card border-x border-b border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-bg-surface">
                      <th className="label-mono p-4 text-text-muted">OPERATOR</th>
                      <th className="label-mono p-4 text-text-muted hidden md:table-cell">EMAIL</th>
                      <th className="label-mono p-4 text-text-muted">LEVEL</th>
                      <th className="label-mono p-4 text-text-muted">ROLE</th>
                      <th className="label-mono p-4 text-text-muted text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b border-border hover:bg-bg-surface/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-sm text-text-primary">{p.full_name}</p>
                          <p className="font-mono text-[10px] text-text-muted md:hidden">{p.email}</p>
                        </td>
                        <td className="p-4 font-mono text-xs text-text-secondary hidden md:table-cell">{p.email}</td>
                        <td className="p-4 font-mono text-xs text-text-primary">{p.class_level || "—"}</td>
                        <td className="p-4">
                          <span className={`label-mono text-[9px] px-2 py-0.5 border ${p.is_admin ? "border-warning text-warning" : "border-border text-text-muted"}`}>
                            {p.is_admin ? "ADMIN" : "STUDENT"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleAdmin(p.id, p.is_admin)}
                            className="label-mono text-[9px] text-accent hover:underline"
                          >
                            {p.is_admin ? "DEMOTE" : "PROMOTE"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {profiles.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-10 text-center font-mono text-xs text-text-muted">
                          NO OPERATORS INDEXED.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(section === "COURSE" || section === "MODULE" || section === "LESSON" || section === "ASSESSMENT") && (
            <form onSubmit={submit} className="space-y-px bg-border">
              {section === "COURSE" && (
                <>
                  <Field label="COURSE CODE" value={course.code} onChange={(v) => setCourse({ ...course, code: v })} placeholder="MTH101" mono />
                  <Field label="TITLE" value={course.title} onChange={(v) => setCourse({ ...course, title: v })} placeholder="Mathematics" />
                  <Field label="CLASS LEVELS (comma-separated)" value={course.levels} onChange={(v) => setCourse({ ...course, levels: v })} placeholder="SS1,SS2,SS3" mono />
                  <TextArea label="DESCRIPTION" value={course.description} onChange={(v) => setCourse({ ...course, description: v })} placeholder="Curriculum-aligned mathematics..." />
                </>
              )}
              {section === "MODULE" && (
                <>
                  <Field label="PARENT COURSE CODE" value={mod.courseCode} onChange={(v) => setMod({ ...mod, courseCode: v })} placeholder="MTH101" mono />
                  <Field label="MODULE TITLE" value={mod.title} onChange={(v) => setMod({ ...mod, title: v })} placeholder="Algebraic Processes" />
                  <Field label="ORDER INDEX" value={mod.position} onChange={(v) => setMod({ ...mod, position: v })} placeholder="2" mono />
                </>
              )}
              {section === "LESSON" && (
                <>
                  <Field label="PARENT MODULE ID (uuid)" value={lesson.moduleId} onChange={(v) => setLesson({ ...lesson, moduleId: v })} placeholder="uuid..." mono />
                  <Field label="LESSON TITLE" value={lesson.title} onChange={(v) => setLesson({ ...lesson, title: v })} placeholder="Quadratic Equations" />
                  <Field label="YOUTUBE URL" value={lesson.video} onChange={(v) => setLesson({ ...lesson, video: v })} placeholder="https://youtube.com/watch?v=..." mono />
                  <Field label="POSITION" value={lesson.position} onChange={(v) => setLesson({ ...lesson, position: v })} placeholder="1" mono />
                  <TextArea label="LESSON NOTES" value={lesson.notes} onChange={(v) => setLesson({ ...lesson, notes: v })} placeholder="Key concepts, formulas, examples..." />
                </>
              )}
              {section === "ASSESSMENT" && (
                <>
                  <Field label="PARENT LESSON ID (uuid)" value={quiz.lessonId} onChange={(v) => setQuiz({ ...quiz, lessonId: v })} placeholder="uuid..." mono />
                  <Field label="QUIZ TITLE" value={quiz.title} onChange={(v) => setQuiz({ ...quiz, title: v })} placeholder="Quadratic Equations" />
                  <TextArea
                    label='QUESTIONS (JSON: [{"q":"...","options":["A","B","C","D"],"correct":0}])'
                    value={quiz.json}
                    onChange={(v) => setQuiz({ ...quiz, json: v })}
                    placeholder='[{"q":"2+2","options":["3","4","5","6"],"correct":1}]'
                    mono
                  />
                </>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full label-mono bg-accent text-white py-4 font-bold hover:bg-accent-dim transition-colors mt-px disabled:opacity-50"
              >
                {busy ? "DEPLOYING..." : `DEPLOY ${section} →`}
              </button>
            </form>
          )}
        </div>

        <p className="font-mono text-xs text-text-muted mt-6">
          // ALL WRITES PERSIST TO SUPABASE. NO UNDO. VERIFY BEFORE DEPLOY.
        </p>

        {section !== "REGISTRY" && (
          <div className="mt-10 border-l-2 border-accent bg-bg-surface p-5">
            <span className="label-mono text-accent">// HINT: FETCH IDS</span>
            <p className="text-text-secondary text-sm mt-2 font-mono">
              To get a module/lesson UUID, run on Supabase SQL editor:<br />
              <span className="text-text-primary">select id, title from modules where course_id = (select id from courses where code = 'MTH101');</span>
            </p>
            <button
              onClick={async () => {
                const { data } = await supabase.from("courses").select("code, id").order("code");
                alert((data ?? []).map((c) => `${c.code}: ${c.id}`).join("\n") || "No courses");
              }}
              className="mt-3 label-mono border border-border text-text-primary px-4 py-2 hover:border-accent hover:text-accent transition-colors"
            >
              LIST COURSE IDS
            </button>
            <Link to="/catalog" className="ml-3 label-mono text-accent">VIEW CATALOG →</Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div className="bg-bg-card">
      <label className="label-mono text-text-muted block px-4 pt-3">{label}</label>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-bg-card px-4 py-3 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent ${mono ? "font-mono text-sm" : ""}`}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div className="bg-bg-card">
      <label className="label-mono text-text-muted block px-4 pt-3">{label}</label>
      <textarea
        required
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-bg-card px-4 py-3 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent resize-none ${mono ? "font-mono text-sm" : ""}`}
      />
    </div>
  );
}
