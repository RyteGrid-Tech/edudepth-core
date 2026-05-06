import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduDepth Concepts — Operating system for Nigerian students" },
      { name: "description", content: "Structured WAEC, NECO and JAMB prep. Subject by subject. Topic by topic. Built to clear exams." },
      { property: "og:title", content: "EduDepth Concepts" },
      { property: "og:description", content: "The operating system for Nigerian students who study to pass." },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { label: "ACTIVE STUDENTS", value: "12,847" },
  { label: "MODULES DEPLOYED", value: "184" },
  { label: "LESSONS INDEXED", value: "2,394" },
  { label: "PASS RATE", value: "94.2%" },
];

const MODULES = [
  { code: "MTH101", title: "Mathematics", level: "SS1–SS3", lessons: 142, topics: ["Algebra", "Geometry", "Calculus", "Statistics"] },
  { code: "PHY101", title: "Physics", level: "SS1–SS3", lessons: 118, topics: ["Mechanics", "Waves", "Electricity", "Modern Physics"] },
  { code: "CHM101", title: "Chemistry", level: "SS1–SS3", lessons: 124, topics: ["Atomic Theory", "Organic", "Inorganic", "Acids & Bases"] },
  { code: "BIO101", title: "Biology", level: "SS1–SS3", lessons: 136, topics: ["Cells", "Genetics", "Ecology", "Human Anatomy"] },
  { code: "ENG101", title: "English Language", level: "SS1–SS3", lessons: 98, topics: ["Comprehension", "Lexis", "Oral", "Essay"] },
  { code: "ECN101", title: "Economics", level: "SS2–SS3", lessons: 86, topics: ["Demand", "Supply", "Macro", "Public Finance"] },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <SiteHeader />

      {/* HERO */}
      <section className="px-5 md:px-8 pt-12 md:pt-20 pb-16 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-1.5 bg-accent" />
          <span className="label-mono text-accent">A RYTEGRID INFRASTRUCTURE BUILD</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight max-w-4xl">
          The syllabus is fixed.<br />
          <span className="text-accent">Your strategy</span> shouldn't be.
        </h1>
        <p className="text-base md:text-lg text-text-secondary mt-6 max-w-2xl leading-relaxed">
          Structure beats motivation. Every time. EduDepth is the operating system for Nigerian students who are done guessing and ready to clear WAEC, NECO and JAMB — by subject, by topic, by result.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            to="/auth"
            className="label-mono bg-accent text-white px-6 py-3.5 font-bold hover:bg-accent-dim transition-colors text-center"
          >
            INITIALIZE ACCOUNT →
          </Link>
          <Link
            to="/auth"
            className="label-mono border border-border text-text-primary px-6 py-3.5 font-semibold hover:border-accent hover:text-accent transition-colors text-center"
          >
            VIEW MODULE CATALOG
          </Link>
        </div>

        {/* terminal status */}
        <div className="mt-12 border-l-2 border-accent bg-bg-surface px-4 py-3 max-w-md">
          <p className="font-mono text-xs text-text-secondary">
            <span className="text-success">●</span> SYSTEM STATUS: ONLINE
          </p>
          <p className="font-mono text-xs text-text-muted mt-1">
            UPTIME: 99.98% <span className="blink"></span>
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-bg-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 md:px-8 py-8 ${i !== 0 ? "md:border-l border-border" : ""} ${i % 2 !== 0 ? "border-l border-border md:border-l" : ""} ${i >= 2 ? "border-t md:border-t-0 border-border" : ""}`}
            >
              <div className="font-mono text-2xl md:text-4xl font-bold text-text-primary">{s.value}</div>
              <div className="label-mono text-text-muted mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MODULE PREVIEW */}
      <section className="px-5 md:px-8 py-16 md:py-20 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="label-mono text-accent">// MODULE CATALOG</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Deploy. Study. Clear.</h2>
            <p className="text-text-secondary mt-2 max-w-xl">Curriculum-aligned modules built for WAEC, NECO and JAMB. Every lesson sequenced. Every topic accountable.</p>
          </div>
          <Link to="/auth" className="label-mono text-accent hover:text-text-primary transition-colors">
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {MODULES.map((m) => (
            <div key={m.code} className="bg-bg-card p-6 hover:bg-bg-surface transition-colors group cursor-pointer border-l-2 border-transparent hover:border-accent">
              <div className="flex items-start justify-between mb-4">
                <span className="font-mono text-xs text-accent">{m.code}</span>
                <span className="label-mono text-text-muted border border-border px-2 py-1">{m.level}</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">{m.title}</h3>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {m.topics.map((t) => (
                  <span key={t} className="font-mono text-[10px] text-text-secondary border border-border px-2 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-mono text-xs text-text-muted">{m.lessons} LESSONS</span>
                <span className="label-mono text-accent group-hover:translate-x-1 transition-transform">DEPLOY →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="px-5 md:px-8 py-16 border-t border-border bg-bg-surface">
        <div className="max-w-4xl mx-auto">
          <span className="label-mono text-accent">// OPERATING PRINCIPLE</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 leading-tight">
            Students don't fail because they're lazy.<br />
            <span className="text-text-secondary">They fail because the system is noise.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border mt-10">
            {[
              { n: "01", t: "Right Inputs", d: "Verified curriculum content. No filler. No tangents. What WAEC asks, you study." },
              { n: "02", t: "Right Systems", d: "Sequenced lessons. Locked progression. Assessments after every clear. No shortcuts." },
              { n: "03", t: "Right Outcomes", d: "Trackable performance. Honest scores. Real readiness before exam day." },
            ].map((p) => (
              <div key={p.n} className="bg-bg-primary p-6">
                <div className="font-mono text-3xl text-accent font-bold">{p.n}</div>
                <h3 className="text-lg font-bold mt-3 mb-2">{p.t}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-8 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Ready to <span className="text-accent">clear your exams?</span>
        </h2>
        <p className="text-text-secondary mt-4 max-w-xl mx-auto">Initialize your account. Deploy your first module. Start operating.</p>
        <Link
          to="/auth"
          className="inline-block label-mono bg-accent text-white px-8 py-4 font-bold hover:bg-accent-dim transition-colors mt-8"
        >
          INITIALIZE ACCOUNT →
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
