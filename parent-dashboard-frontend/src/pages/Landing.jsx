import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  NotebookPen,
  FolderClosed,
  Sparkles,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Button, Alert } from "../components/ui";
import NovaMark from "../components/NovaMark";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../api/client";
import { SITE } from "../siteConfig";

const DEMO_EMAIL = "demo@antaripath.com";
const DEMO_PASSWORD = "TryTheDemo2026";

const FEATURES = [
  {
    Icon: NotebookPen,
    title: "Log the day-to-day",
    body: "Appointments, home practice, and observations — quick entries with a mood and a note.",
  },
  {
    Icon: FolderClosed,
    title: "Keep the documents",
    body: "Upload an IEP or insurance letter and have the key dates pulled out for you — encrypted and visible only to you.",
  },
  {
    Icon: Sparkles,
    title: "A summary on demand",
    body: "A plain-language description of the pattern — written only when you ask for it.",
  },
  {
    Icon: Share2,
    title: "Share what matters",
    body: "A clean report for a school or insurer, or a quick-reference card for a sitter — ready when you need it.",
  },
];

// The brand panel's "what this does" line, reused here too — same wording
// as the sign-in screens so the story stays consistent everywhere it's told.
const TAGLINE =
  "A calm place to log the day-to-day: appointments, notes, reports, and what you're noticing. Pull it all together whenever you need to share it.";

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tryingDemo, setTryingDemo] = useState(false);
  const [error, setError] = useState("");

  const tryDemo = async () => {
    setTryingDemo(true);
    setError("");
    try {
      await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "Couldn't open the demo right now. Please try again."));
      setTryingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ---- header ---- */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-pine text-white">
            <NovaMark size={16} />
          </span>
          <span className="font-display text-lg font-semibold text-ink">{SITE.name}</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
          Log in
        </Link>
      </header>

      {/* ---- hero ---- */}
      <section className="mx-auto max-w-2xl px-5 pb-12 pt-6 text-center sm:px-8 sm:pb-16 sm:pt-10">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {TAGLINE}
        </h1>

        {error && (
          <div className="mx-auto mt-6 max-w-sm text-left">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={tryDemo} disabled={tryingDemo} className="w-full sm:w-auto">
            {tryingDemo ? "Opening…" : "Try the demo — no signup needed"}
            {!tryingDemo && <ArrowRight size={15} />}
          </Button>
          <Link
            to="/signup"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunk sm:w-auto"
          >
            Create your account
          </Link>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          The demo logs into a shared sample account — click around freely, nothing there is real.
        </p>
      </section>

      {/* ---- the story ---- */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-xl px-5 py-12 sm:px-8">
          <p className="text-base font-medium text-ink">{SITE.name} began with my son, Chase.</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            When he experienced a speech delay, I found myself trying to keep track of
            everything — home exercises, therapy appointments, school forms, insurance
            paperwork — scattered across a Notes app, a folder on the counter, and emails I
            could never find again. Whenever I needed to share his history with a school, a new
            therapist, or insurance, I was piecing it all back together from memory.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            So I built the tool I wished existed. It&rsquo;s not just for speech delays —
            appointments, OT or PT, learning support, a chronic condition, regular doctor
            visits — it doesn&rsquo;t assume why you&rsquo;re tracking.
          </p>
        </div>
      </section>

      {/* ---- what it does ---- */}
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine-soft text-pine">
                <Icon size={17} />
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
                <p className="mt-0.5 text-sm text-ink-soft">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- the guardrail ---- */}
      <section className="border-t border-line bg-surface-sunk">
        <div className="mx-auto max-w-xl px-5 py-10 text-center sm:px-8">
          <p className="text-sm leading-relaxed text-ink-soft">
            {SITE.name} doesn&rsquo;t evaluate your child or tell you whether they&rsquo;re on
            track. It just makes it easier to keep everything in one place, and to share what
            you already know without starting from scratch every time.
          </p>
        </div>
      </section>

      {/* ---- footer CTA ---- */}
      <section className="mx-auto max-w-2xl px-5 py-12 text-center sm:px-8">
        <Button onClick={tryDemo} disabled={tryingDemo} className="w-full sm:w-auto">
          {tryingDemo ? "Opening…" : "Try the demo"}
        </Button>
        <p className="mt-3 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-pine-dark hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-8 text-xs text-ink-faint">
          <Link to="/about" className="hover:underline">About</Link>
          {" · "}
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          {" · "}
          <Link to="/terms" className="hover:underline">Terms</Link>
        </p>
      </section>
    </div>
  );
}
