import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  getPlatformMetrics,
  listAllCourses,
  updateCourse,
  deleteCourse,
  listAllQuizResults,
  type Profile,
  type Course,
  type QuizResult,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  Library,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  ChevronRight,
  Menu,
  X,
  History,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Command Center — EduDepth" }] }),
  component: () => (
    <RequireAuth admin>
      <AdminPage />
    </RequireAuth>
  ),
});

const SECTIONS = [
  { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
  { id: "REGISTRY", label: "User Registry", icon: Users },
  { id: "ATTEMPTS", label: "Quiz Attempts", icon: History },
  { id: "CATALOG", label: "Content Catalog", icon: Library },
  { id: "COURSE", label: "Deploy Course", icon: BookOpen },
  { id: "MODULE", label: "Deploy Module", icon: Layers },
  { id: "LESSON", label: "Deploy Lesson", icon: GraduationCap },
  { id: "ASSESSMENT", label: "Deploy Quiz", icon: FileText },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function AdminPage() {
  const [section, setSection] = useState<SectionId>("OVERVIEW");
  const [busy, setBusy] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    lessonsCompleted: 0,
  });
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [attempts, setAttempts] = useState<QuizResult[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // form state
  const [editId, setEditId] = useState<string | null>(null);
  const [course, setCourse] = useState({ code: "", title: "", description: "", levels: "SS3" });
  const [mod, setMod] = useState({ courseCode: "", title: "", position: "1" });
  const [lesson, setLesson] = useState({
    moduleId: "",
    title: "",
    video: "",
    notes: "",
    position: "1",
  });

  // Dual-mode Quiz state
  const [quizMode, setQuizMode] = useState<"FORM" | "JSON">("FORM");
  const [quizMeta, setQuizMeta] = useState({ lessonId: "", title: "" });
  const [quizQuestions, setQuizQuestions] = useState([
    { q: "", options: ["", "", "", ""], correct: 0 },
  ]);
  const [quizJson, setQuizJson] = useState("");

  useEffect(() => {
    if (section === "REGISTRY") fetchProfiles();
    if (section === "OVERVIEW") fetchMetrics();
    if (section === "CATALOG") fetchAllCourses();
    if (section === "ATTEMPTS") fetchAttempts();
  }, [section]);

  async function fetchProfiles() {
    try {
      const data = await listProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchMetrics() {
    try {
      const data = await getPlatformMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAllCourses() {
    try {
      const data = await listAllCourses();
      setAllCourses(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchAttempts() {
    try {
      const data = await listAllQuizResults();
      setAttempts(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleAdmin(pid: string, current: boolean) {
    try {
      await toggleAdmin(pid, !current);
      setProfiles(profiles.map((p) => (p.id === pid ? { ...p, is_admin: !current } : p)));
      toast.success("Privileges updated.");
    } catch (err) {
      toast.error("Failed to update role.");
    }
  }

  async function handleTogglePublish(cid: string, current: boolean) {
    try {
      await updateCourse(cid, { is_published: !current });
      setAllCourses(allCourses.map((c) => (c.id === cid ? { ...c, is_published: !current } : c)));
      toast.success("Publication status updated.");
    } catch (err) {
      toast.error("Failed to update status.");
    }
  }

  async function handleDeleteCourse(cid: string) {
    if (!confirm("Are you sure? This will delete all modules and lessons for this course.")) return;
    try {
      await deleteCourse(cid);
      setAllCourses(allCourses.filter((c) => c.id !== cid));
      toast.success("Course purged from system.");
    } catch (err) {
      toast.error("Deletion failed.");
    }
  }

  function enterEditCourse(c: Course) {
    setEditId(c.id);
    setCourse({
      code: c.code,
      title: c.title,
      description: c.description || "",
      levels: (c.class_levels || []).join(", "),
    });
    setSection("COURSE");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (section === "COURSE") {
        if (!course.code.trim() || !course.title.trim()) {
          throw new Error("Course code and title are required.");
        }
        const levelsArray = course.levels
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (levelsArray.length === 0) {
          throw new Error("At least one class level (e.g., SS3) is required.");
        }

        const payload = {
          code: course.code.trim().toUpperCase(),
          title: course.title.trim(),
          description: course.description.trim(),
          class_levels: levelsArray,
        };
        if (editId) {
          await updateCourse(editId, payload);
          toast.success(`Course ${course.code} updated.`);
        } else {
          await createCourse(payload);
          toast.success(`Course ${course.code} deployed.`);
        }
        setCourse({ code: "", title: "", description: "", levels: "SS3" });
        setEditId(null);
      } else if (section === "MODULE") {
        if (!mod.courseCode.trim() || !mod.title.trim()) {
          throw new Error("Parent course code and module title are required.");
        }
        const courseId = await getCourseIdByCode(mod.courseCode.trim());
        if (!courseId) throw new Error(`Course with code "${mod.courseCode}" not found.`);
        await createModule({
          course_id: courseId,
          title: mod.title.trim(),
          position: Number(mod.position) || 1,
        });
        toast.success("Module deployed.");
        setMod({ courseCode: "", title: "", position: "1" });
      } else if (section === "LESSON") {
        if (!lesson.moduleId.trim() || !lesson.title.trim()) {
          throw new Error("Module ID and lesson title are required.");
        }
        await createLesson({
          module_id: lesson.moduleId.trim(),
          title: lesson.title.trim(),
          video_url: lesson.video.trim(),
          notes_text: lesson.notes,
          position: Number(lesson.position) || 1,
        });
        toast.success("Lesson registered.");
        setLesson({ moduleId: "", title: "", video: "", notes: "", position: "1" });
      } else if (section === "ASSESSMENT") {
        if (!quizMeta.lessonId.trim()) {
          throw new Error("Lesson ID is required.");
        }

        let questionsData = [];

        if (quizMode === "FORM") {
          questionsData = quizQuestions.map((q, idx) => {
            if (!q.q.trim() || q.options.some((o) => !o.trim())) {
              throw new Error(`Question ${idx + 1} has empty fields.`);
            }
            return {
              question_text: q.q.trim(),
              option_a: q.options[0].trim(),
              option_b: q.options[1].trim(),
              option_c: q.options[2].trim(),
              option_d: q.options[3].trim(),
              correct_option: (["a", "b", "c", "d"] as const)[q.correct],
            };
          });
        } else {
          if (!quizJson.trim()) {
            throw new Error("Questions JSON is required.");
          }
          let parsed;
          try {
            parsed = JSON.parse(quizJson);
          } catch (e) {
            throw new Error("Invalid JSON format.");
          }
          if (!Array.isArray(parsed)) {
            throw new Error("JSON must be an array.");
          }
          questionsData = parsed.map((q, idx) => {
            if (!q.q || !q.options || !Array.isArray(q.options) || q.options.length < 4) {
              throw new Error(`Question at index ${idx} is malformed.`);
            }
            return {
              question_text: q.q,
              option_a: q.options[0],
              option_b: q.options[1],
              option_c: q.options[2],
              option_d: q.options[3],
              correct_option: (["a", "b", "c", "d"] as const)[q.correct] || "a",
            };
          });
        }

        if (questionsData.length === 0) {
          throw new Error("No questions provided.");
        }

        await createQuizWithQuestions(
          quizMeta.lessonId.trim(),
          quizMeta.title.trim() || "Assessment",
          questionsData,
        );
        toast.success(`Assessment with ${questionsData.length} questions created.`);
        setQuizMeta({ lessonId: "", title: "" });
        setQuizQuestions([{ q: "", options: ["", "", "", ""], correct: 0 }]);
        setQuizJson("");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Admin operation failed:", err);
      toast.error(err?.message || "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="flex min-h-screen bg-bg-primary">
        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <span className="label-mono text-accent">COMMAND MENU</span>
              <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = section === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSection(s.id);
                      setSidebarOpen(false);
                      if (s.id !== "COURSE") setEditId(null);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-6 py-3.5 label-mono text-[10px] transition-colors
                      ${
                        isActive
                          ? "text-accent bg-bg-surface border-l-2 border-accent"
                          : "text-text-muted hover:text-text-primary hover:bg-bg-surface/50"
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                    <span>{s.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                  </button>
                );
              })}
            </nav>

            <div className="p-6 border-t border-border mt-auto">
              <p className="font-mono text-[9px] text-text-muted leading-tight uppercase">
                RYTEGRID SYSTEM v1.0.5
                <br />
                AUTHORIZED ACCESS ONLY
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-hidden">
          <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
            {/* Mobile Header Toggle */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 label-mono text-accent bg-bg-surface px-3 py-2 border border-border"
              >
                <Menu className="h-4 w-4" />
                <span>MENU</span>
              </button>
              <span className="label-mono text-[10px] text-warning border border-warning px-2 py-1">
                ROOT
              </span>
            </div>

            <p className="font-mono text-xs text-text-muted">
              edudepth@admin:~$ <span className="text-accent">sudo {section.toLowerCase()}</span>
            </p>
            <div className="flex items-center justify-between flex-wrap gap-3 mt-2 mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {SECTIONS.find((s) => s.id === section)?.label}{" "}
                {editId && section === "COURSE" && "(Editing)"}
              </h1>
              <span className="hidden lg:inline label-mono border border-warning text-warning px-3 py-1.5">
                ROOT ACCESS
              </span>
            </div>

            <div className="mt-px">
              {section === "OVERVIEW" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
                  <MetricCard label="TOTAL OPERATORS" value={metrics.totalUsers} />
                  <MetricCard label="COURSES DEPLOYED" value={metrics.totalCourses} />
                  <MetricCard label="ACTIVE ENROLLMENTS" value={metrics.totalEnrollments} />
                  <MetricCard label="LESSONS COMPLETED" value={metrics.lessonsCompleted} accent />
                </div>
              )}

              {section === "REGISTRY" && (
                <div className="bg-bg-card border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-bg-surface">
                          <th className="label-mono p-4 text-text-muted">OPERATOR</th>
                          <th className="label-mono p-4 text-text-muted hidden md:table-cell">
                            EMAIL
                          </th>
                          <th className="label-mono p-4 text-text-muted">LEVEL</th>
                          <th className="label-mono p-4 text-text-muted">ROLE</th>
                          <th className="label-mono p-4 text-text-muted text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-border hover:bg-bg-surface/50 transition-colors"
                          >
                            <td className="p-4">
                              <p className="font-bold text-sm text-text-primary">{p.full_name}</p>
                              <p className="font-mono text-[10px] text-text-muted md:hidden">
                                {p.email}
                              </p>
                            </td>
                            <td className="p-4 font-mono text-xs text-text-secondary hidden md:table-cell">
                              {p.email}
                            </td>
                            <td className="p-4 font-mono text-xs text-text-primary">
                              {p.class_level || "—"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`label-mono text-[9px] px-2 py-0.5 border ${p.is_admin ? "border-warning text-warning" : "border-border text-text-muted"}`}
                              >
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
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {section === "ATTEMPTS" && (
                <div className="bg-bg-card border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-bg-surface">
                          <th className="label-mono p-4 text-text-muted">STUDENT</th>
                          <th className="label-mono p-4 text-text-muted">QUIZ / LESSON</th>
                          <th className="label-mono p-4 text-text-muted">SCORE</th>
                          <th className="label-mono p-4 text-text-muted text-right">TIMESTAMP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((a) => (
                          <tr
                            key={a.id}
                            className="border-b border-border hover:bg-bg-surface/50 transition-colors"
                          >
                            <td className="p-4">
                              <p className="font-bold text-sm text-text-primary">
                                {a.profiles?.full_name}
                              </p>
                              <p className="font-mono text-[9px] text-text-muted">
                                {a.profiles?.email}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-text-primary font-bold">
                                {a.quizzes?.title || a.quizzes?.lessons?.title}
                              </p>
                              <p className="font-mono text-[9px] text-accent">
                                {a.quizzes?.lessons?.modules?.courses?.code}
                              </p>
                            </td>
                            <td className="p-4">
                              <span
                                className={`font-mono text-sm font-bold ${a.score / a.total >= 0.7 ? "text-success" : "text-danger"}`}
                              >
                                {a.score}/{a.total}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono text-[9px] text-text-muted uppercase">
                              {new Date(a.submitted_at).toLocaleDateString()}{" "}
                              {new Date(a.submitted_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))}
                        {attempts.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-10 text-center font-mono text-xs text-text-muted"
                            >
                              NO ATTEMPTS RECORDED.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {section === "CATALOG" && (
                <div className="bg-bg-card border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-bg-surface">
                          <th className="label-mono p-4 text-text-muted">CODE</th>
                          <th className="label-mono p-4 text-text-muted">TITLE</th>
                          <th className="label-mono p-4 text-text-muted">STATUS</th>
                          <th className="label-mono p-4 text-text-muted text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allCourses.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-border hover:bg-bg-surface/50 transition-colors"
                          >
                            <td className="p-4 font-mono text-xs text-accent">{c.code}</td>
                            <td className="p-4">
                              <p className="font-bold text-sm text-text-primary">{c.title}</p>
                              {c.description && (
                                <p className="font-mono text-[10px] text-text-muted hidden md:block">
                                  {c.description.substring(0, 60)}...
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`label-mono text-[9px] px-2 py-0.5 border ${c.is_published ? "border-success text-success" : "border-warning text-warning"}`}
                              >
                                {c.is_published ? "PUBLISHED" : "DRAFT"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => enterEditCourse(c)}
                                  className="text-text-muted hover:text-accent transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleTogglePublish(c.id, c.is_published)}
                                  className="text-text-muted hover:text-accent transition-colors"
                                  title={c.is_published ? "Unpublish" : "Publish"}
                                >
                                  {c.is_published ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(c.id)}
                                  className="text-text-muted hover:text-danger transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(section === "COURSE" ||
                section === "MODULE" ||
                section === "LESSON" ||
                section === "ASSESSMENT") && (
                <div className="max-w-3xl">
                  <form onSubmit={submit} className="space-y-px bg-border border border-border">
                    {section === "COURSE" && (
                      <>
                        <Field
                          label="COURSE CODE"
                          value={course.code}
                          onChange={(v) => setCourse({ ...course, code: v })}
                          placeholder="MTH101"
                          mono
                        />
                        <Field
                          label="TITLE"
                          value={course.title}
                          onChange={(v) => setCourse({ ...course, title: v })}
                          placeholder="Mathematics"
                        />
                        <Field
                          label="CLASS LEVELS (comma-separated)"
                          value={course.levels}
                          onChange={(v) => setCourse({ ...course, levels: v })}
                          placeholder="SS1,SS2,SS3"
                          mono
                        />
                        <TextArea
                          label="DESCRIPTION"
                          value={course.description}
                          onChange={(v) => setCourse({ ...course, description: v })}
                          placeholder="Curriculum-aligned mathematics..."
                        />
                      </>
                    )}
                    {section === "MODULE" && (
                      <>
                        <Field
                          label="PARENT COURSE CODE"
                          value={mod.courseCode}
                          onChange={(v) => setMod({ ...mod, courseCode: v })}
                          placeholder="MTH101"
                          mono
                        />
                        <Field
                          label="MODULE TITLE"
                          value={mod.title}
                          onChange={(v) => setMod({ ...mod, title: v })}
                          placeholder="Algebraic Processes"
                        />
                        <Field
                          label="ORDER INDEX"
                          value={mod.position}
                          onChange={(v) => setMod({ ...mod, position: v })}
                          placeholder="2"
                          mono
                        />
                      </>
                    )}
                    {section === "LESSON" && (
                      <>
                        <Field
                          label="PARENT MODULE ID (uuid)"
                          value={lesson.moduleId}
                          onChange={(v) => setLesson({ ...lesson, moduleId: v })}
                          placeholder="uuid..."
                          mono
                        />
                        <Field
                          label="LESSON TITLE"
                          value={lesson.title}
                          onChange={(v) => setLesson({ ...lesson, title: v })}
                          placeholder="Quadratic Equations"
                        />
                        <Field
                          label="YOUTUBE URL"
                          value={lesson.video}
                          onChange={(v) => setLesson({ ...lesson, video: v })}
                          placeholder="https://youtube.com/watch?v=..."
                          mono
                        />
                        <Field
                          label="POSITION"
                          value={lesson.position}
                          onChange={(v) => setLesson({ ...lesson, position: v })}
                          placeholder="1"
                          mono
                        />
                        <TextArea
                          label="LESSON NOTES"
                          value={lesson.notes}
                          onChange={(v) => setLesson({ ...lesson, notes: v })}
                          placeholder="Key concepts, formulas, examples..."
                        />
                      </>
                    )}
                    {section === "ASSESSMENT" && (
                      <div className="space-y-px">
                        <Field
                          label="PARENT LESSON ID (uuid)"
                          value={quizMeta.lessonId}
                          onChange={(v) => setQuizMeta({ ...quizMeta, lessonId: v })}
                          placeholder="uuid..."
                          mono
                        />
                        <Field
                          label="QUIZ TITLE"
                          value={quizMeta.title}
                          onChange={(v) => setQuizMeta({ ...quizMeta, title: v })}
                          placeholder="Quadratic Equations"
                        />

                        <div className="bg-bg-card p-4 flex items-center gap-4 border-b border-border">
                          <span className="label-mono text-text-muted text-[10px]">INPUT MODE</span>
                          <div className="flex bg-bg-surface p-0.5 rounded border border-border">
                            <button
                              type="button"
                              onClick={() => setQuizMode("FORM")}
                              className={`px-3 py-1 label-mono text-[9px] transition-colors ${quizMode === "FORM" ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"}`}
                            >
                              DYNAMIC FORM
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizMode("JSON")}
                              className={`px-3 py-1 label-mono text-[9px] transition-colors ${quizMode === "JSON" ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"}`}
                            >
                              BULK JSON
                            </button>
                          </div>
                        </div>

                        {quizMode === "FORM" ? (
                          <div className="space-y-px">
                            {quizQuestions.map((q, idx) => (
                              <div key={idx} className="bg-bg-surface p-4 border-b border-border">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="label-mono text-accent text-[10px]">
                                    QUESTION {String(idx + 1).padStart(2, "0")}
                                  </span>
                                  {quizQuestions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setQuizQuestions(quizQuestions.filter((_, i) => i !== idx))
                                      }
                                      className="label-mono text-[9px] text-danger hover:underline"
                                    >
                                      REMOVE
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-3">
                                  <input
                                    required
                                    placeholder="Question text..."
                                    value={q.q}
                                    onChange={(e) => {
                                      const next = [...quizQuestions];
                                      next[idx].q = e.target.value;
                                      setQuizQuestions(next);
                                    }}
                                    className="w-full bg-bg-card px-3 py-2 text-sm text-text-primary outline-none border border-border focus:border-accent"
                                  />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {["A", "B", "C", "D"].map((opt, optIdx) => (
                                      <div key={opt} className="flex items-center gap-2">
                                        <span className="label-mono text-[10px] text-text-muted w-4">
                                          {opt}
                                        </span>
                                        <input
                                          required
                                          placeholder={`Option ${opt}...`}
                                          value={q.options[optIdx]}
                                          onChange={(e) => {
                                            const next = [...quizQuestions];
                                            next[idx].options[optIdx] = e.target.value;
                                            setQuizQuestions(next);
                                          }}
                                          className="flex-1 bg-bg-card px-3 py-1.5 text-xs text-text-primary outline-none border border-border focus:border-accent"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-3 pt-2">
                                    <span className="label-mono text-[10px] text-text-muted">
                                      CORRECT OPTION
                                    </span>
                                    <select
                                      value={q.correct}
                                      onChange={(e) => {
                                        const next = [...quizQuestions];
                                        next[idx].correct = Number(e.target.value);
                                        setQuizQuestions(next);
                                      }}
                                      className="bg-bg-card text-xs text-text-primary px-2 py-1 outline-none border border-border focus:border-accent"
                                    >
                                      <option value={0}>OPTION A</option>
                                      <option value={1}>OPTION B</option>
                                      <option value={2}>OPTION C</option>
                                      <option value={3}>OPTION D</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setQuizQuestions([
                                  ...quizQuestions,
                                  { q: "", options: ["", "", "", ""], correct: 0 },
                                ])
                              }
                              className="w-full flex items-center justify-center gap-2 py-3 bg-bg-card hover:bg-bg-surface transition-colors border-t border-border"
                            >
                              <Plus className="h-3.5 w-3.5 text-accent" />
                              <span className="label-mono text-[9px] text-accent">
                                ADD ANOTHER QUESTION
                              </span>
                            </button>
                          </div>
                        ) : (
                          <TextArea
                            label='QUESTIONS (JSON: [{"q":"...","options":["A","B","C","D"],"correct":0}])'
                            value={quizJson}
                            onChange={(v) => setQuizJson(v)}
                            placeholder='[{"q":"2+2","options":["3","4","5","6"],"correct":1}]'
                            mono
                          />
                        )}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full label-mono bg-accent text-white py-4 font-bold hover:bg-accent-dim transition-colors mt-px disabled:opacity-50"
                    >
                      {busy
                        ? "PROCESSING..."
                        : editId && section === "COURSE"
                          ? "UPDATE COURSE →"
                          : `DEPLOY ${section} →`}
                    </button>
                    {editId && section === "COURSE" && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(null);
                          setCourse({ code: "", title: "", description: "", levels: "SS3" });
                        }}
                        className="w-full label-mono bg-bg-surface text-text-muted py-2 text-[10px] hover:text-text-primary"
                      >
                        CANCEL EDIT
                      </button>
                    )}
                  </form>

                  <p className="font-mono text-xs text-text-muted mt-6">
                    // ALL WRITES PERSIST TO SUPABASE. NO UNDO. VERIFY BEFORE DEPLOY.
                  </p>
                </div>
              )}
            </div>

            {section !== "REGISTRY" &&
              section !== "OVERVIEW" &&
              section !== "CATALOG" &&
              section !== "ATTEMPTS" && (
                <div className="mt-10 border-l-2 border-accent bg-bg-surface p-5 max-w-3xl">
                  <span className="label-mono text-accent">// HINT: FETCH IDS</span>
                  <p className="text-text-secondary text-sm mt-2 font-mono">
                    To get a module/lesson UUID, run on Supabase SQL editor:
                    <br />
                    <span className="text-text-primary">
                      select id, title from modules where course_id = (select id from courses where
                      code = 'MTH101');
                    </span>
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={async () => {
                        const { data } = await supabase
                          .from("courses")
                          .select("code, id")
                          .order("code");
                        alert(
                          (data ?? []).map((c) => `${c.code}: ${c.id}`).join("\n") || "No courses",
                        );
                      }}
                      className="label-mono border border-border text-text-primary px-4 py-2 hover:border-accent hover:text-accent transition-colors"
                    >
                      LIST COURSE IDS
                    </button>
                    <Link
                      to="/catalog"
                      className="label-mono flex items-center px-4 py-2 text-accent hover:bg-accent/5 transition-colors"
                    >
                      VIEW CATALOG →
                    </Link>
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className={`bg-bg-card p-6 ${accent ? "border-l-2 border-accent" : ""}`}>
      <div className="font-mono text-3xl font-bold text-text-primary">{value}</div>
      <div className="label-mono text-text-muted mt-2">{label}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
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

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
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
