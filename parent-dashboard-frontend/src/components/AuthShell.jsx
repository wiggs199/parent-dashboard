import { Link } from "react-router-dom";
import { SITE } from "../siteConfig";
import NovaMark from "./NovaMark";
import AuthIllustration from "./AuthIllustration";

const TAGLINE =
  "A calm place to log the day-to-day: appointments, notes, and what you're noticing. Pull it all together whenever you need to share it.";

// Split layout: a quiet brand panel (mark, tagline, the street illustration)
// on the left, the actual form on the right. The illustration is desktop
// only — on a narrow screen it drops out so a tall form (looking at you,
// Signup) never has to compete with it for space — but the tagline itself
// still shows on mobile, just as plain text under the mark.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-surface md:grid md:grid-cols-2">
      {/* Desktop brand panel */}
      <div className="relative hidden overflow-hidden bg-surface-sunk px-10 py-12 md:flex md:flex-col lg:px-14">
        <AuthIllustration />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine text-white shadow-[var(--shadow-btn)]">
            <NovaMark size={17} />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {SITE.name}
          </span>
        </div>
        <p className="relative z-10 mt-auto max-w-xs pt-16 font-display text-xl font-medium leading-snug text-ink">
          {TAGLINE}
        </p>
      </div>

      {/* Mobile header — no illustration, but the tagline still shows */}
      <div className="flex flex-col items-center gap-2 px-6 pt-10 text-center md:hidden">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine text-white shadow-[var(--shadow-btn)]">
          <NovaMark size={20} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {SITE.name}
        </span>
        <p className="mt-1 max-w-xs font-display text-base font-medium leading-snug text-ink-soft">
          {TAGLINE}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6 md:py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] md:border-0 md:p-0 md:shadow-none">
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
    </div>
  );
}
