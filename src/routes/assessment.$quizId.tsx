import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { getQuizWithQuestions, submitQuizResult, type Question } from "@/lib/api";

export const Route = createFileRoute("/assessment/$quizId")({
  head: () => ({ meta: [{ title: "Assessment — EduDepth" }] }),
  component: () => (
    <RequireAuth>
      <AssessmentPage />
    </RequireAuth>
  ),
});

const OPTS = ["a", "b", "c", "d"] as const;

function AssessmentPage() {
  const { quizId } = Route.useParams();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<{ courseCode: string; topic: string }>({
    courseCode: "",
    topic: "",
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizWithQuestions(quizId)
      .then(({ quiz, questions }) => {
        setQuestions(questions);
        const lessonAny = quiz?.lessons as
          | { title: string; modules?: { courses?: { code: string } } }
          | undefined;
        setMeta({
          courseCode: lessonAny?.modules?.courses?.code ?? "",
          topic: quiz?.title ?? lessonAny?.title ?? "Assessment",
        });
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const score = questions.reduce((acc, q, i) => {
    const correctIdx = OPTS.indexOf(q.correct_option);
    return acc + (answers[i] === correctIdx ? 1 : 0);
  }, 0);
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  async function submit() {
    if (!user) return;
    try {
      await submitQuizResult(user.id, quizId, score, questions.length);
    } catch (e) {
      console.error(e);
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-3xl mx-auto">
          <p className="font-mono text-xs text-text-muted">loading assessment...</p>
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-16 max-w-md mx-auto">
          <div className="border-l-2 border-warning bg-bg-surface p-5">
            <p className="label-mono text-warning">NO QUESTIONS</p>
            <p className="text-text-secondary text-sm mt-2 font-mono">
              This assessment has no questions yet.
            </p>
            <Link to="/console" className="inline-block label-mono text-accent mt-4">
              RETURN →
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-8 max-w-3xl mx-auto">
          <p className="font-mono text-xs text-text-muted">
            ASSESSMENT // {meta.courseCode} — {meta.topic}
          </p>
          <span className="label-mono text-accent mt-4 inline-block">// PERFORMANCE REPORT</span>

          <div className="border-l-2 border-accent bg-bg-card p-8 mt-3">
            <div className="font-mono text-6xl md:text-7xl font-bold text-text-primary">
              {score}
              <span className="text-text-muted">/{questions.length}</span>
            </div>
            <div
              className={`font-mono text-2xl mt-2 ${pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-danger"}`}
            >
              {pct}% — {pct >= 70 ? "CLEARED" : pct >= 50 ? "MARGINAL" : "FAILED"}
            </div>
            <p className="text-text-secondary mt-3 text-sm">
              {pct >= 70
                ? "Threshold met. Module advanced."
                : "Threshold not met. Re-run after review."}
            </p>
          </div>

          <div className="mt-8 space-y-px bg-border">
            {questions.map((qu, i) => {
              const opts = [qu.option_a, qu.option_b, qu.option_c, qu.option_d];
              const correctIdx = OPTS.indexOf(qu.correct_option);
              const correct = answers[i] === correctIdx;
              return (
                <div
                  key={qu.id}
                  className={`bg-bg-card p-5 border-l-2 ${correct ? "border-success" : "border-danger"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-mono text-xs text-text-muted">
                      Q{String(i + 1).padStart(2, "0")}
                    </p>
                    <span className={`label-mono ${correct ? "text-success" : "text-danger"}`}>
                      {correct ? "CORRECT" : "INCORRECT"}
                    </span>
                  </div>
                  <p className="text-text-primary mt-2">{qu.question_text}</p>
                  <p className="font-mono text-xs text-text-secondary mt-3">
                    YOUR ANSWER:{" "}
                    <span className={correct ? "text-success" : "text-danger"}>
                      {opts[answers[i]] ?? "—"}
                    </span>
                  </p>
                  {!correct && (
                    <p className="font-mono text-xs text-text-secondary mt-1">
                      CORRECT: <span className="text-success">{opts[correctIdx]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            to="/console"
            className="inline-block label-mono bg-accent text-white px-6 py-3 mt-8 font-bold hover:bg-accent-dim transition-colors"
          >
            RETURN TO CONSOLE →
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-3xl mx-auto">
        <p className="font-mono text-xs text-text-muted">
          ASSESSMENT // {meta.courseCode} — {meta.topic}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Run Assessment</h1>
        <p className="text-text-secondary mt-1">
          {questions.length} questions. No timer. Submit once complete.
        </p>

        <p className="font-mono text-xs text-text-muted mt-6">
          ANSWERED: <span className="text-accent">{Object.keys(answers).length}</span>/
          {questions.length}
        </p>

        <div className="mt-4 space-y-px bg-border">
          {questions.map((qu, i) => {
            const opts = [qu.option_a, qu.option_b, qu.option_c, qu.option_d];
            return (
              <div key={qu.id} className="bg-bg-card p-5">
                <p className="font-mono text-xs text-text-muted">
                  Q{String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-base md:text-lg font-bold mt-2">{qu.question_text}</p>
                <div className="mt-4 space-y-px bg-border">
                  {opts.map((opt, j) => {
                    const selected = answers[i] === j;
                    return (
                      <button
                        key={j}
                        onClick={() => setAnswers({ ...answers, [i]: j })}
                        className={`w-full text-left p-4 transition-colors flex items-center gap-3 ${
                          selected
                            ? "bg-bg-card border-l-2 border-accent text-text-primary"
                            : "bg-bg-surface border-l-2 border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-card"
                        }`}
                      >
                        <span className="font-mono text-xs text-text-muted">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={submit}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full md:w-auto label-mono bg-accent text-white px-8 py-4 mt-6 font-bold hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SUBMIT ASSESSMENT →
        </button>
      </div>
    </AppShell>
  );
}
