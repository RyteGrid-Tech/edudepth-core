import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/edudepth-logo.png";

const NAV = [
  { to: "/console", label: "CONSOLE", short: "HOME" },
  { to: "/catalog", label: "CATALOG", short: "MODULES" },
  { to: "/console", label: "PROGRESS", short: "PROGRESS", hash: "progress" },
  { to: "/profile", label: "PROFILE", short: "PROFILE" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-16 md:pb-0">
      {/* Top nav (desktop) */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg-primary">
        <div className="flex items-center justify-between h-14 px-5 md:px-8">
          <Link
            to="/console"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <img src={logo} alt="EduDepth" className="h-7 w-7 object-contain" />
            <span className="text-sm font-bold tracking-wider">EDUDEPTH</span>
            <span className="hidden sm:inline label-mono text-text-muted ml-1">CONCEPTS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV.slice(0, 3).map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className={`label-mono transition-colors ${
                    active ? "text-accent" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/profile"
              className="label-mono border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
            >
              PROFILE
            </Link>
          </nav>
        </div>
      </header>

      {children}

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border grid grid-cols-4">
        {NAV.map((n) => {
          const active = pathname === n.to;
          return (
            <Link
              key={n.short}
              to={n.to}
              className={`label-mono py-3 text-center text-[10px] transition-colors ${
                active ? "text-accent border-t-2 border-accent -mt-px" : "text-text-muted"
              }`}
            >
              {n.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
