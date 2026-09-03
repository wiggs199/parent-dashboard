// `plain` renders the title in the sans face — use it when the title is
// user-entered text (a person's name), so an unusual letterform in the
// display serif never makes someone's name look broken.
export default function PageHeader({ title, subtitle, action, plain = false }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1
          className={`text-[1.7rem] font-semibold leading-tight text-ink ${
            plain ? "tracking-tight" : "font-display"
          }`}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
