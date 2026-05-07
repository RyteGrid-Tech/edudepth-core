import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import {
  createCourse,
  createLesson,
  createModule,
  createQuizWithQuestions,
  getCourseIdByCode,
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

const SECTIONS = ["COURSE", "MODULE", "LESSON", "ASSESSMENT"] as const;
type Section = typeof SECTIONS[number];

function AdminPage() {
  const [section, setSection] = useState<Section>("COURSE");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // form state
  const [course, setCourse] = useState({ code: "", title: "", description: "", levels: "SS3" });
  const [mod, setMod] = useState({ courseCode: "", title: "", position: "1" });
  const [lesson, setLesson] = useState({ moduleId: "", title: "", video: "", notes: "", position: "1" });
  const [quiz, setQuiz] = useState({ lessonId: "", title: "", json: "" });

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 4500);
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
      } else {
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
      <div className="px-5 md:px-8 py-8 max-w-5xl mx-auto">
        <p className="font-mono text-xs text-text-muted">edudepth@admin:~$ <span className="text-accent">sudo control</span></p>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Control Panel</h1>
          <span className="label-mono border border-warning text-warning px-3 py-1.5">PRIVILEGED</span>
        </div>

        {msg && (
          <div className={`border-l-2 ${msg.ok ? "border-success" : "border-danger"} bg-bg-surface p-4 mt-6`}>
            <p className={`font-mono text-sm ${msg.ok ? "text-success" : "text-danger"}`}>● {msg.text}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mt-6">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setSection(s); setMsg(null); }}
              className={`label-mono py-3 transition-colors ${
                section === s ? "bg-bg-card text-accent border-l-2 border-accent" : "bg-bg-surface text-text-muted hover:text-text-primary"
              }`}
            >
              CREATE {s}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-px space-y-px bg-border">
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

        <p className="font-mono text-xs text-text-muted mt-6">
          // ALL WRITES PERSIST TO SUPABASE. NO UNDO. VERIFY BEFORE DEPLOY.
        </p>

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
