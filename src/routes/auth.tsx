import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/edudepth-logo.png";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Access System — EduDepth Concepts" },
      {
        name: "description",
        content: "Initialize your EduDepth account or access an existing session.",
      },
    ],
  }),
  component: AuthPage,
});

const CLASS_LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3", "Post-secondary"];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", level: "SS1" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin + "/console",
            data: { full_name: form.name, class_level: form.level },
          },
        });
        if (error) throw error;
        navigate({ to: "/console" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        navigate({ to: "/console" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/console" },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* minimal header */}
      <header className="px-5 md:px-8 py-5 border-b border-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="EduDepth" className="h-7 w-7 object-contain" />
          <span className="text-sm font-bold tracking-wider">EDUDEPTH</span>
        </Link>
        <Link to="/" className="label-mono text-text-muted hover:text-accent transition-colors">
          ← RETURN
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 md:px-8 py-10 md:py-16">
        <div className="w-full max-w-md">
          {/* terminal header */}
          <div className="mb-8">
            <p className="font-mono text-xs text-text-muted">
              edudepth@auth:~${" "}
              <span className="text-accent">{mode === "login" ? "access" : "init"}</span>
              <span className="blink"></span>
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {mode === "login" ? "Access System" : "Initialize Account"}
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              {mode === "login"
                ? "Resume your operation. Credentials required."
                : "Provision a new student profile. All fields required."}
            </p>
          </div>

          {/* mode toggle */}
          <div className="grid grid-cols-2 gap-px bg-border mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`label-mono py-3 transition-colors ${
                  mode === m
                    ? "bg-bg-card text-accent border-l-2 border-accent"
                    : "bg-bg-surface text-text-muted hover:text-text-primary"
                }`}
              >
                {m === "login" ? "ACCESS" : "INITIALIZE"}
              </button>
            ))}
          </div>

          {error && (
            <div className="border-l-2 border-danger bg-bg-surface px-4 py-3 mb-5">
              <p className="label-mono text-danger mb-1">ERROR</p>
              <p className="text-sm text-text-primary font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-px bg-border">
            {mode === "signup" && (
              <Field label="FULL NAME" id="name">
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-bg-card px-4 py-3.5 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent"
                  placeholder="Adaobi Okeke"
                />
              </Field>
            )}
            <Field label="EMAIL ADDRESS" id="email">
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-bg-card px-4 py-3.5 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent font-mono text-sm"
                placeholder="student@domain.com"
              />
            </Field>
            <Field label="PASSWORD" id="password">
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-bg-card px-4 py-3.5 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent font-mono text-sm"
                placeholder="••••••••"
              />
            </Field>
            {mode === "signup" && (
              <Field label="CLASS LEVEL" id="level">
                <select
                  id="level"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full bg-bg-card px-4 py-3.5 text-text-primary outline-none focus:bg-bg-surface border-l-2 border-transparent focus:border-accent font-mono text-sm appearance-none"
                >
                  {CLASS_LEVELS.map((l) => (
                    <option key={l} value={l} className="bg-bg-card">
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full label-mono bg-accent text-white px-6 py-4 font-bold hover:bg-accent-dim transition-colors disabled:opacity-50 mt-px"
            >
              {loading ? (
                <span>
                  PROCESSING<span className="blink"></span>
                </span>
              ) : mode === "login" ? (
                "ACCESS SYSTEM →"
              ) : (
                "INITIALIZE ACCOUNT →"
              )}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="label-mono text-text-muted">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full label-mono border border-border text-text-primary py-3.5 hover:border-accent hover:text-accent transition-colors"
          >
            ACCESS VIA GOOGLE
          </button>

          <p className="font-mono text-xs text-text-muted text-center mt-8 leading-relaxed">
            BY PROCEEDING YOU ACCEPT THE OPERATING TERMS
            <br />
            OF EDUDEPTH CONCEPTS // RYTEGRID
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-card">
      <label htmlFor={id} className="label-mono text-text-muted block px-4 pt-3">
        {label}
      </label>
      {children}
    </div>
  );
}
