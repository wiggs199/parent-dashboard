// Small shared primitives so every page looks like one app.

export function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary:
    "bg-sage text-surface hover:bg-sage-dark disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-soft hover:bg-surface-sunk hover:text-ink disabled:opacity-50",
  outline:
    "border border-line-strong bg-surface text-ink hover:bg-surface-sunk disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

const inputBase =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/25";

export function TextInput({ className = "", ...rest }) {
  return <input className={`${inputBase} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={`${inputBase} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...rest }) {
  return <textarea className={`${inputBase} ${className}`} {...rest} />;
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Alert({ children }) {
  return (
    <div className="rounded-lg border border-clay/30 bg-clay-soft px-4 py-2.5 text-sm text-clay">
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft text-sage">
          <Icon size={20} strokeWidth={1.75} />
        </span>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {children && <p className="max-w-sm text-sm text-ink-soft">{children}</p>}
    </Card>
  );
}
