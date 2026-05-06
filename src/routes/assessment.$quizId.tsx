import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MOCK_QUIZ } from "@/lib/mockData";

export const Route = createFileRoute("/assessment/$quizId")({
  head: () => ({ meta: [{ title: "Assessment — EduDepth" }] }),
  component: AssessmentPage,
});

function AssessmentPage() {
  // TODO: connect to Supabase — fetch quiz by id
  const q = MOCK_QUIZ;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = q.questions.reduce((acc, qu, i) => acc + (answers[i] === qu.correct ? 1 : 0), 0);
  const pct = Math.round((score / q.questions.length) * 100);

  function submit() {
    // TODO: connect to Supabase — insert into quiz_results (immutable)
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <AppShell>
        <div className="px-5 md:px-8 py-8 max-w-3xl mx-auto">
          <p className="font-mono text-xs text-text-muted">
            ASSESSMENT // {q.course} — {q.topic}
          </p>
          <span className="label-mono text-accent mt-4 inline-block">// PERFORMANCE REPORT</span>

          <div className="border-l-2 border-accent bg-bg-card p-8 mt-3">
            <div className="font-mono text-6xl md:text-7xl font-bold text-text-primary">
              {score}<span className="text-text-muted">/{q.questions.length}</span>
            </div>
            <div className={`font-mono text-2xl mt-2 ${pct >= 70 ? "text-success" : pct >= 50 ? "text-warning" : "text-danger"}`}>
              {pct}% — {pct >= 70 ? "CLEARED" : pct >= 50 ? "MARGINAL" : "FAILED"}
            </div>
            <p className="text-text-secondary mt-3 text-sm">
              {pct >= 70 ? "Threshold met. Module advanced." : "Threshold not met. Re-run after review."}
            </p>
          </div>

          <div className="mt-8 space-y-px bg-border">
            {q.questions.map((qu, i) => {
              const correct = answers[i] === qu.correct;
              return (
                <div key={i} className={`bg-bg-card p-5 border-l-2 ${correct ? "border-success" : "border-danger"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-mono text-xs text-text-muted">Q{String(i + 1).padStart(2, "0")}</p>
                    <span className={`label-mono ${correct ? "text-success" : "text-danger"}`}>
                      {correct ? "CORRECT" : "INCORRECT"}
                    </span>
                  </div>
                  <p className="text-text-primary mt-2">{qu.q}</p>
                  <p className="font-mono text-xs text-text-secondary mt-3">
                    YOUR ANSWER: <span className={correct ? "text-success" : "text-danger"}>{qu.options[answers[i]] ?? "—"}</span>
                  </p>
                  {!correct && (
                    <p className="font-mono text-xs text-text-secondary mt-1">
                      CORRECT: <span className="text-success">{qu.options[qu.correct]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            to="/course/$courseCode"
            params={{ courseCode: q.course }}
            className="inline-block label-mono bg-accent text-white px-6 py-3 mt-8 font-bold hover:bg-accent-dim transition-colors"
          >
            RETURN TO MODULE →
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-3xl mx-auto">
        <p className="font-mono text-xs text-text-muted">
          ASSESSMENT // {q.course} — {q.topic}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Run Assessment</h1>
        <p className="text-text-secondary mt-1">{q.questions.length} questions. No timer. Submit once complete.</p>

        <p className="font-mono text-xs text-text-muted mt-6">
          ANSWERED: <span className="text-accent">{Object.keys(answers).length}</span>/{q.questions.length}
        </p>

        <div className="mt-4 space-y-px bg-border">
          {q.questions.map((qu, i) => (
            <div key={i} className="bg-bg-card p-5">
              <p className="font-mono text-xs text-text-muted">Q{String(i + 1).padStart(2, "0")}</p>
              <p className="text-base md:text-lg font-bold mt-2">{qu.q}</p>
              <div className="mt-4 space-y-px bg-border">
                {qu.options.map((opt, j) => {
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
                      <span className="font-mono text-xs text-text-muted">{String.fromCharCode(65 + j)}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={Object.keys(answers).length !== q.questions.length}
          className="w-full md:w-auto label-mono bg-accent text-white px-8 py-4 mt-6 font-bold hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SUBMIT ASSESSMENT →
        </button>
      </div>
    </AppShell>
  );
}
