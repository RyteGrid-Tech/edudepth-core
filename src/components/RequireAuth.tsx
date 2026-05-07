import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children, admin }: { children: React.ReactNode; admin?: boolean }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (admin && profile && !profile.is_admin) navigate({ to: "/console" });
  }, [user, profile, loading, admin, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="font-mono text-xs text-text-muted">
          edudepth@system:~$ <span className="text-accent">authenticating...</span>
        </p>
      </div>
    );
  }
  if (admin && profile && !profile.is_admin) return null;
  return <>{children}</>;
}
