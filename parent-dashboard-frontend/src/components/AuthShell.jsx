import { Sparkles } from "lucide-react";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage text-surface">
            <Sparkles size={18} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          {children}
        </div>

        {footer && (
          <p className="mt-4 text-center text-sm text-ink-soft">{footer}</p>
        )}
      </div>
    </div>
  );
}
