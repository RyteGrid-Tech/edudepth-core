import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  getCourseByCode,
  getCourseTree,
  listProgress,
  type Course,
  type Lesson,
  type Module,
} from "@/lib/api";

export const Route = createFileRoute("/course/$courseCode")({
  head: () => ({ meta: [{ title: "Course Architecture — EduDepth" }] }),
  component: () => (
    <RequireAuth>
      <CoursePage />
    </RequireAuth>
  ),
});

function CoursePage() {
  const { courseCode } = Route.useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCourseByCode(courseCode).then(async (c) => {
      setCourse(c);
      if (c) {
        const tree = await getCourseTree(c.id);
        setModules(tree.modules);
        setLessons(tree.lessons);
      }
      setLoading(false);
    });
  }, [courseCode]);

  useEffect(() => {
    if (!user) return;
    listProgress(user.id).then((p) => {
      setCompleted(new Set(p.filter((x) => x.completed).map((x) => x.lesson_id)));
    });
  }, [user]);

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-5xl mx-auto">
          <p className="font-mono text-xs text-text-muted">loading course...</p>
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-md mx-auto">
          <div className="border-l-2 border-danger bg-bg-surface p-5">
            <p className="label-mono text-danger">COURSE NOT FOUND</p>
            <Link to="/catalog" className="inline-block label-mono text-accent mt-4">RETURN TO CATALOG →</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const totalLessons = lessons.length;
  const clearedCount = lessons.filter((l) => completed.has(l.id)).length;
  const progress = totalLessons ? Math.round((clearedCount / totalLessons) * 100) : 0;

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-5xl mx-auto">
        <p className="font-mono text-xs text-text-muted mb-6">
          <Link to="/catalog" className="hover:text-accent">CATALOG</Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-accent">{course.code}</span>
        </p>

        <div className="border-l-2 border-accent bg-bg-card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono text-xs text-accent">{course.code}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">{course.title}</h1>
            </div>
            {course.class_levels?.[0] && (
              <span className="label-mono text-text-muted border border-border px-3 py-1.5">
                {course.class_levels.join(" · ")}
              </span>
            )}
          </div>
          <p className="text-text-secondary mt-3 max-w-2xl leading-relaxed">{course.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-px bg-border">
            <Stat l="PROGRESS" v={`${progress}%`} accent />
            <Stat l="MODULES" v={String(modules.length)} />
            <Stat l="LESSONS" v={String(totalLessons)} />
          </div>

          <div className="h-1 bg-bg-surface mt-5">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-8">
          <span className="label-mono text-accent">// MODULE STRUCTURE</span>
          {modules.length === 0 ? (
            <div className="border-l-2 border-warning bg-bg-surface p-5 mt-4">
              <p className="label-mono text-warning">NO MODULES YET</p>
              <p className="text-sm text-text-secondary mt-1">This course has no published modules.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-px bg-border">
              {modules.map((m, i) => {
                const ml = lessons.filter((l) => l.module_id === m.id);
                return (
                  <details key={m.id} open={i === 0} className="bg-bg-card group">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-bg-surface transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-text-muted">M{String(i + 1).padStart(2, "0")}</span>
                        <h3 className="text-lg font-bold">{m.title}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-text-secondary">{ml.length} LESSONS</span>
                        <span className="label-mono text-accent group-open:rotate-90 transition-transform">▸</span>
                      </div>
                    </summary>
                    <div className="border-t border-border">
                      {ml.map((l, j) => {
                        const cleared = completed.has(l.id);
                        return (
                          <Link
                            key={l.id}
                            to="/lesson/$lessonId"
                            params={{ lessonId: l.id }}
                            className="block hover:bg-bg-surface transition-colors"
                          >
                            <div className={`flex items-center justify-between px-5 py-3.5 border-b border-border last:border-b-0 ${
                              cleared ? "border-l-2 border-l-success" : ""
                            }`}>
                              <div className="flex items-center gap-4 min-w-0">
                                <span className="font-mono text-xs text-text-muted shrink-0">L{String(j + 1).padStart(2, "0")}</span>
                                <span className="text-sm truncate">{l.title}</span>
                              </div>
                              <span className={`label-mono ${cleared ? "text-success" : "text-text-muted"}`}>
                                {cleared ? "CLEARED" : "—"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
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
