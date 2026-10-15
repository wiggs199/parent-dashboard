import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, TriangleAlert, MessageCircle, Stethoscope, Phone, Printer } from "lucide-react";
import NovaMark from "../components/NovaMark";
import { getHandoffCard } from "../api/resources";
import { errorMessage } from "../api/client";
import { ageLabel } from "../lib/child";
import { SITE } from "../siteConfig";

// Public, unauthenticated — this is what opens when someone taps the link a
// parent texted them. No login, no app chrome, nothing beyond what the
// parent explicitly filled in for this card. Sized to be read in a few
// seconds by someone who's never seen this before.

function Section({ icon: Icon, accent, title, children }) {
  return (
    <div className="flex gap-3 border-t border-line py-4 first:border-t-0 first:pt-0">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          accent ? "bg-persimmon-soft text-persimmon" : "bg-pine-soft text-pine"
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {title}
        </h2>
        <div className="mt-1 text-sm leading-relaxed text-ink">{children}</div>
      </div>
    </div>
  );
}

export default function HandoffCard() {
  const { token } = useParams();
  const [card, setCard] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | notfound | error
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getHandoffCard(token)
      .then((data) => {
        if (cancelled) return;
        setCard(data);
        setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setState("notfound");
        } else {
          setState("error");
          setError(errorMessage(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-soft">Loading…</p>
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-paper px-4 text-center">
        <p className="text-sm font-medium text-ink">This link isn't valid.</p>
        <p className="text-sm text-ink-soft">
          It may have been turned off. Ask the parent for an updated link.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <p className="text-sm text-persimmon">{error}</p>
      </div>
    );
  }

  const age = ageLabel(card.birth_year);
  const hasAny =
    card.handoff_helps ||
    card.handoff_avoid ||
    card.handoff_communication ||
    card.handoff_medical ||
    card.handoff_contacts?.length;

  return (
    <div className="min-h-screen bg-paper">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print flex justify-end px-4 pt-4 sm:px-6">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink"
        >
          <Printer size={13} /> Print
        </button>
      </div>

      <div className="mx-auto max-w-sm px-4 pb-10 pt-2 sm:pt-6">
        <div className="card overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-[var(--shadow-lift)]">
          <div className="bg-pine px-5 pb-4 pt-5 text-white">
            <div className="mb-3 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] opacity-85">
              <NovaMark size={13} />
              {SITE.name} · Handoff card
            </div>
            <h1 className="font-display text-2xl font-semibold leading-tight">{card.name}</h1>
            {age && <p className="mt-0.5 text-sm opacity-85">{age}</p>}
          </div>

          <div className="px-5 py-1">
            {!hasAny && (
              <p className="py-4 text-sm text-ink-faint">
                This parent hasn't added anything to the card yet.
              </p>
            )}
            {card.handoff_helps && (
              <Section icon={Heart} title="What helps">
                <p className="whitespace-pre-wrap">{card.handoff_helps}</p>
              </Section>
            )}
            {card.handoff_avoid && (
              <Section icon={TriangleAlert} accent title="What to avoid">
                <p className="whitespace-pre-wrap">{card.handoff_avoid}</p>
              </Section>
            )}
            {card.handoff_communication && (
              <Section icon={MessageCircle} title="Communication">
                <p className="whitespace-pre-wrap">{card.handoff_communication}</p>
              </Section>
            )}
            {card.handoff_medical && (
              <Section icon={Stethoscope} accent title="Medical">
                <p className="whitespace-pre-wrap">{card.handoff_medical}</p>
              </Section>
            )}
            {card.handoff_contacts?.length > 0 && (
              <Section icon={Phone} title="Who to call">
                <div className="space-y-0.5">
                  {card.handoff_contacts.map((c, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="font-medium text-ink">{c.name}</span>
                      <span className="text-ink-soft">{c.phone}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="border-t border-line bg-surface-sunk px-5 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-faint">
              <NovaMark size={12} className="text-pine" />
              Made with {SITE.name}
            </div>
            <p className="mt-1 text-[0.68rem] text-ink-faint">
              Parent-provided information for a caregiver — not a medical document.
            </p>
          </div>
        </div>

        <p className="no-print mt-5 text-center text-xs text-ink-faint">
          <Link to="/about" className="hover:underline">
            What's {SITE.name}?
          </Link>
        </p>
      </div>
    </div>
  );
}
