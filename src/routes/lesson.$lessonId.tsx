import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MOCK_LESSON } from "@/lib/mockData";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — EduDepth" }] }),
  component: LessonPage,
});

function LessonPage() {
  // TODO: connect to Supabase — fetch lesson by id
  const l = MOCK_LESSON;
  const [cleared, setCleared] = useState(false);

  function clearLesson() {
    // TODO: connect to Supabase — upsert into user_progress
    setCleared(true);
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-6 max-w-6xl mx-auto">
        {/* breadcrumb */}
        <p className="font-mono text-xs text-text-muted mb-5">
          <Link to="/catalog" className="hover:text-accent">{l.course}</Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-text-secondary">MODULE {l.moduleNum}</span>
          <span className="mx-2 text-border">/</span>
          <span className="text-accent">LESSON {l.num}</span>
        </p>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{l.title}</h1>
        <p className="font-mono text-xs text-text-muted mt-1">DURATION {l.duration}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border mt-6">
          {/* video */}
          <div className="lg:col-span-2 bg-black aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${l.youtubeId}`}
              title={l.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* notes sidebar */}
          <aside className="bg-bg-card p-5">
            <span className="label-mono text-accent">// LESSON NOTES</span>
            <pre className="font-mono text-xs text-text-secondary mt-3 whitespace-pre-wrap leading-relaxed">{l.notes}</pre>
            <button
              onClick={() => {/* TODO: connect to Supabase — fetch signed URL */}}
              className="mt-5 w-full label-mono border border-border text-text-primary py-2.5 hover:border-accent hover:text-accent transition-colors"
            >
              DOWNLOAD PDF ↓
            </button>
          </aside>
        </div>

        {/* actions */}
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
                className="label-mono bg-accent text-bg-primary px-6 py-3 font-bold hover:bg-accent-dim transition-colors"
              >
                CLEAR LESSON ✓
              </button>
            ) : l.hasQuiz ? (
              <Link
                to="/assessment/$quizId"
                params={{ quizId: "q1" }}
                className="label-mono bg-accent text-bg-primary px-6 py-3 font-bold hover:bg-accent-dim transition-colors"
              >
                RUN ASSESSMENT →
              </Link>
            ) : null}
            <Link
              to="/course/$courseCode"
              params={{ courseCode: l.course }}
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
