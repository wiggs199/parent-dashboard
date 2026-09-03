import { Link } from "react-router-dom";
import { SITE } from "../siteConfig";
import NovaMark from "./NovaMark";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-pine text-white">
              <NovaMark size={15} />
            </span>
            <span className="font-display text-[17px] font-semibold text-ink">
              {SITE.name}
            </span>
          </Link>
          <Link to="/login" className="text-sm font-medium text-pine-dark hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="font-display text-[1.8rem] font-semibold text-ink">{title}</h1>
        {updated && (
          <p className="mt-1 text-sm text-ink-faint">Last updated {updated}</p>
        )}
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
          {children}
        </div>

        <p className="mt-12 border-t border-line pt-6 text-xs text-ink-faint">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          {" · "}
          <Link to="/terms" className="hover:underline">Terms</Link>
        </p>
      </main>
    </div>
  );
}

export function LegalSection({ heading, children }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-ink">{heading}</h2>
      {children}
    </section>
  );
}
