import { Link } from "react-router-dom";
import { SITE } from "../siteConfig";
import NovaMark from "./NovaMark";
import AuthIllustration from "./AuthIllustration";

const TAGLINE =
  "A calm place to log the day-to-day: appointments, notes, reports, and what you're noticing. Pull it all together whenever you need to share it.";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-paper px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(70% 45% at 50% -5%, color-mix(in srgb, var(--color-pine) 12%, transparent), transparent)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine text-white shadow-[var(--shadow-btn)]">
            <NovaMark size={20} />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {SITE.name}
          </span>
          <AuthIllustration />
          <p className="max-w-xs font-display text-base font-medium leading-snug text-ink-soft">
            {TAGLINE}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
          {children}
        </div>

        {footer && (
          <p className="mt-4 text-center text-sm text-ink-soft">{footer}</p>
        )}

        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link to="/about" className="hover:underline">About</Link>
          {" · "}
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          {" · "}
          <Link to="/terms" className="hover:underline">Terms</Link>
        </p>
      </div>
    </div>
  );
}
