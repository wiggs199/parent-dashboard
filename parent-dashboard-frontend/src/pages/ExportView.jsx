import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { getChild, listLogs } from "../api/resources";
import { errorMessage } from "../api/client";
import { ageLabel } from "../lib/child";
import { SITE } from "../siteConfig";

const fmtLong = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const fmtShort = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function ExportView() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [logs, setLogs] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getChild(id), listLogs(id)])
      .then(([c, l]) => {
        if (cancelled) return;
        setChild(c);
        setLogs(l);
        setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        setState(err?.response?.status === 404 ? "missing" : "error");
        setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const shown = useMemo(() => {
    return logs
      .filter((l) => (!from || l.date >= from) && (!to || l.date <= to))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
  }, [logs, from, to]);

  const counts = useMemo(() => {
    const ex = shown.filter((l) => l.type === "exercise").length;
    return { total: shown.length, exercise: ex, exploration: shown.length - ex };
  }, [shown]);

  if (state === "loading") return <p className="p-8 text-sm text-ink-soft">Loading…</p>;
  if (state === "missing")
    return (
      <div className="p-8">
        <p className="text-sm text-ink">Child not found.</p>
        <Link to="/" className="text-sm text-pine-dark hover:underline">Back to dashboard</Link>
      </div>
    );
  if (state === "error")
    return (
      <div className="p-8">
        <p className="text-sm text-persimmon">{error}</p>
        <Link to="/" className="text-sm text-pine-dark hover:underline">Back to dashboard</Link>
      </div>
    );

  const span =
    shown.length > 0
      ? `${fmtShort(shown[0].date)} – ${fmtShort(shown[shown.length - 1].date)}`
      : "—";

  return (
    <div className="min-h-screen bg-surface-sunk">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .paper { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
          body { background: #fff !important; }
          @page { margin: 18mm 16mm; }
          .log-row { break-inside: avoid; }
        }
      `}</style>

      {/* toolbar */}
      <div className="no-print sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-5 py-3">
          <Link
            to={`/children/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={15} /> Back
          </Link>
          <label className="ml-auto text-xs text-ink-soft">
            From{" "}
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border border-line-strong px-1.5 py-1 text-xs"
            />
          </label>
          <label className="text-xs text-ink-soft">
            To{" "}
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border border-line-strong px-1.5 py-1 text-xs"
            />
          </label>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-pine px-4 py-2 text-sm font-medium text-surface hover:bg-pine-dark"
          >
            <Printer size={15} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* the document */}
      <div className="mx-auto my-8 max-w-3xl">
        <div className="paper bg-surface px-10 py-12 shadow-sm sm:px-14">
          <header className="border-b border-line pb-5">
            <h1 className="text-2xl font-semibold text-ink">{child.name}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              Activity record
              {ageLabel(child.birth_year) ? ` · ${ageLabel(child.birth_year)}` : ""}
            </p>
            <p className="mt-3 text-xs text-ink-faint">
              Prepared {fmtLong(new Date().toISOString().slice(0, 10))} · {SITE.name}.
              An organizational record kept by the parent or caregiver — not a
              clinical assessment.
            </p>
          </header>

          {(child.focus_areas?.length || child.profile_notes) && (
            <section className="border-b border-line py-5">
              {child.focus_areas?.length > 0 && (
                <p className="text-sm text-ink">
                  <span className="font-medium">Focus areas: </span>
                  {child.focus_areas.join(", ")}
                </p>
              )}
              {child.profile_notes && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">
                  {child.profile_notes}
                </p>
              )}
            </section>
          )}

          <section className="py-5">
            <p className="text-sm text-ink-soft">
              {counts.total} {counts.total === 1 ? "entry" : "entries"}
              {counts.total > 0 && (
                <>
                  {" "}· {counts.exercise} exercise, {counts.exploration} exploration ·{" "}
                  {span}
                </>
              )}
              {(from || to) && (
                <>
                  {" "}
                  <span className="text-ink-faint">
                    (filtered{from ? ` from ${fmtShort(from)}` : ""}
                    {to ? ` to ${fmtShort(to)}` : ""})
                  </span>
                </>
              )}
            </p>

            {shown.length === 0 ? (
              <p className="mt-6 text-sm text-ink-faint">No entries in this range.</p>
            ) : (
              <div className="mt-4 divide-y divide-line">
                {shown.map((log) => (
                  <div key={log.id} className="log-row grid grid-cols-[7rem_1fr] gap-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-ink">{fmtShort(log.date)}</div>
                      <div className="text-xs uppercase tracking-wide text-ink-faint">
                        {log.type}
                      </div>
                    </div>
                    <div className="text-sm">
                      {log.practiced_items && (
                        <p className="text-ink">{log.practiced_items}</p>
                      )}
                      {log.notes && <p className="text-ink-soft">{log.notes}</p>}
                      {log.mood_rating != null && (
                        <p className="text-xs text-ink-faint">Mood {log.mood_rating}/5</p>
                      )}
                      {!log.practiced_items && !log.notes && log.mood_rating == null && (
                        <p className="text-ink-faint">—</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
