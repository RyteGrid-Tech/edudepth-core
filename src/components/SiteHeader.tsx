import { Link } from "@tanstack/react-router";
import logo from "@/assets/edudepth-logo.png";

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-14 px-5 md:px-8 border-b border-border bg-bg-primary">
      <Link to="/" className="flex items-center gap-2.5">
        <img src={logo} alt="EduDepth Concepts" className="h-7 w-7 object-contain bg-text-primary p-0.5" />
        <span className="text-sm font-bold tracking-wider text-text-primary">EDUDEPTH</span>
        <span className="hidden sm:inline label-mono text-text-muted ml-1">CONCEPTS</span>
      </Link>
      <div className="flex items-center gap-3 md:gap-6">
        <Link to="/auth" className="hidden md:inline label-mono text-text-secondary hover:text-accent transition-colors">Modules</Link>
        <Link to="/auth" className="label-mono text-text-secondary hover:text-accent transition-colors">Access</Link>
        <Link
          to="/auth"
          className="label-mono border border-accent text-accent px-3 py-1.5 hover:bg-accent hover:text-bg-primary transition-colors font-semibold"
        >
          Initialize →
        </Link>
      </div>
    </nav>
  );
}
