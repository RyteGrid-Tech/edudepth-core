import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { getLesson, getQuizForLesson, markLessonComplete, type Quiz } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — EduDepth" }] }),
  component: () => (
    <RequireAuth>
      <LessonPage />
    </RequireAuth>
  ),
});

type LessonRow = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  notes_text: string | null;
  notes_pdf_url: string | null;
  modules: {
    id: string;
    title: string;
    position: number;
    course_id: string;
    courses: { id: string; code: string; title: string };
  };
};

function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("/embed/")) return url;
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function LessonPage() {
  const { lessonId } = Route.useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LessonRow | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [cleared, setCleared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getLesson(lessonId), getQuizForLesson(lessonId)])
      .then(([l, q]) => {
        setLesson(l as unknown as LessonRow);
        setQuiz(q);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_progress")
      .select("completed")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle()
      .then(({ data }) => setCleared(Boolean(data?.completed)));
  }, [user, lessonId]);

  async function clearLesson() {
    if (!user) return;
    setBusy(true);
    try {
      await markLessonComplete(user.id, lessonId);
      setCleared(true);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-6xl mx-auto">
          <p className="font-mono text-xs text-text-muted">loading lesson...</p>
        </div>
      </AppShell>
    );
  }

  if (!lesson) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-md mx-auto">
          <div className="border-l-2 border-danger bg-bg-surface p-5">
            <p className="label-mono text-danger">LESSON NOT FOUND</p>
            <Link to="/console" className="inline-block label-mono text-accent mt-4">
              RETURN TO CONSOLE →
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const courseCode = lesson.modules.courses.code;
  const embed = youtubeEmbed(lesson.video_url);

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-6 max-w-6xl mx-auto">
        <p className="font-mono text-xs text-text-muted mb-5">
          <Link to="/course/$courseCode" params={{ courseCode }} className="hover:text-accent">
            {courseCode}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-text-secondary">MODULE {lesson.modules.position}</span>
        </p>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-text-secondary mt-1 text-sm">{lesson.description}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border mt-6">
          <div className="lg:col-span-2 bg-black aspect-video">
            {embed ? (
              <iframe
                src={embed}
                title={lesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="font-mono text-xs text-text-muted">// NO VIDEO ATTACHED</p>
              </div>
            )}
          </div>

          <aside className="bg-bg-card p-5">
            <span className="label-mono text-accent">// LESSON NOTES</span>
            <pre className="font-mono text-xs text-text-secondary mt-3 whitespace-pre-wrap leading-relaxed">
              {lesson.notes_text || "No notes provided."}
            </pre>
            {lesson.notes_pdf_url && (
              <a
                href={lesson.notes_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block text-center label-mono border border-border text-text-primary py-2.5 hover:border-accent hover:text-accent transition-colors"
              >
                DOWNLOAD PDF ↓
              </a>
            )}
          </aside>
        </div>

        <div className="mt-6 border-t border-border pt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <p className="label-mono text-text-muted">LESSON STATUS</p>
            <p className={`font-mono text-sm mt-1 ${cleared ? "text-success" : "text-warning"}`}>
              {cleared ? "● CLEARED" : "● IN PROGRESS"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {!cleared ? (
              <button
                onClick={clearLesson}
                disabled={busy}
                className="label-mono bg-accent text-white px-6 py-3 font-bold hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                {busy ? "SAVING..." : "CLEAR LESSON ✓"}
              </button>
            ) : quiz ? (
              <Link
                to="/assessment/$quizId"
                params={{ quizId: quiz.id }}
                className="label-mono bg-accent text-white px-6 py-3 font-bold hover:bg-accent-dim transition-colors"
              >
                RUN ASSESSMENT →
              </Link>
            ) : null}
            <Link
              to="/course/$courseCode"
              params={{ courseCode }}
              className="label-mono border border-border text-text-primary px-6 py-3 hover:border-accent hover:text-accent transition-colors text-center"
            >
              RETURN TO MODULE
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
