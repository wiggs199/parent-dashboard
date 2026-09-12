// Small shared primitives so every page looks like one app.
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import NovaMark from "./NovaMark";

export function Card({ className = "", elevated = false, children, ...rest }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-surface ${
        elevated ? "shadow-[var(--shadow-card)]" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: "bg-pine text-white shadow-[var(--shadow-btn)] hover:bg-pine-dark",
  warm: "bg-persimmon text-white shadow-[var(--shadow-btn)] hover:bg-persimmon-dark",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-sunk hover:text-ink",
  outline: "border border-line-strong bg-surface text-ink hover:bg-surface-sunk",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-[background-color,box-shadow,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

const inputBase =
  "w-full rounded-xl border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/25";

export function TextInput({ className = "", ...rest }) {
  return <input className={`${inputBase} ${className}`} {...rest} />;
}

// A password field with a show/hide toggle — used on login, signup, and
// password reset. Defaults to hidden; toggling doesn't submit the form.
export function PasswordInput({ className = "", ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`${inputBase} pr-10 ${className}`}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-faint hover:text-ink"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
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
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Alert({ children }) {
  return (
    <div className="rounded-xl border border-persimmon/30 bg-persimmon-soft px-4 py-2.5 text-sm text-persimmon-dark">
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <Card
      elevated
      className="flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-pine-soft text-pine">
        {Icon ? <Icon size={20} strokeWidth={1.75} /> : <NovaMark size={20} />}
      </span>
      <p className="font-display text-lg text-ink">{title}</p>
      {children && (
        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{children}</p>
      )}
    </Card>
  );
}
