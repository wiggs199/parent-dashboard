import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, Sparkles } from "lucide-react";
import { getChild, listLogs, listDocuments, getLogSummary } from "../api/resources";
import { errorMessage } from "../api/client";
import { ageLabel } from "../lib/child";
import { LOG_TYPES, logType, mood as moodMeta, timeOfDay, timeOfDayRank } from "../lib/log";
import { RANGE_PRESETS } from "../lib/reportRange";
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

const DOC_CATEGORY = {
  therapist: "Therapist",
  school: "School / IEP",
  insurance: "Insurance",
  other: "Other",
};

export default function ExportView() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [logs, setLogs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preset, setPreset] = useState("all");
  // which types are included — all on by default
  const [types, setTypes] = useState(() => new Set(LOG_TYPES.map((t) => t.value)));

  // AI summary — on-demand only, never generated automatically.
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | ok | error
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getChild(id), listLogs(id), listDocuments(id).catch(() => [])])
      .then(([c, l, d]) => {
        if (cancelled) return;
        setChild(c);
        setLogs(l);
        setDocs(d);
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

  // A stale AI summary shouldn't linger once the filters it described change.
  const resetAiSummary = () => {
    setAiStatus("idle");
    setAiText("");
    setAiError("");
  };

  const applyPreset = (key) => {
    setPreset(key);
    const p = RANGE_PRESETS.find((x) => x.key === key);
    if (p) {
      const { from: f, to: t } = p.range();
      setFrom(f);
      setTo(t);
      resetAiSummary();
    }
  };

  const toggleType = (value) => {
    setTypes((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
    resetAiSummary();
  };

  const generateAiSummary = async () => {
    setAiStatus("loading");
    setAiError("");
    try {
      const allTypesSelected = types.size === LOG_TYPES.length;
      const { summary } = await getLogSummary(id, {
        from: from || undefined,
        to: to || undefined,
        types: allTypesSelected ? undefined : [...types].join(","),
      });
      setAiText(summary);
      setAiStatus("ok");
    } catch (err) {
      setAiError(errorMessage(err, "Couldn't generate a summary. Please try again."));
      setAiStatus("error");
    }
  };

  const shown = useMemo(() => {
    return logs
      .filter(
        (l) =>
          (!from || l.date >= from) &&
          (!to || l.date <= to) &&
          types.has(l.type),
      )
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        const t = timeOfDayRank(a.time_of_day) - timeOfDayRank(b.time_of_day);
        return t || a.id - b.id;
      });
  }, [logs, from, to, types]);

  const summary = useMemo(() => {
    const byType = {};
    const moods = [];
    const days = new Set();
    for (const l of shown) {
      byType[l.type] = (byType[l.type] || 0) + 1;
      days.add(l.date);
      if (l.mood_rating != null) moods.push(l.mood_rating);
    }
    const avgMood =
      moods.length > 0
        ? Math.round((moods.reduce((s, n) => s + n, 0) / moods.length) * 10) / 10
        : null;
    return {
      total: shown.length,
      days: days.size,
      byType: LOG_TYPES.filter((t) => byType[t.value]).map((t) => ({
        label: t.label,
        n: byType[t.value],
      })),
      avgMood,
      moodCount: moods.length,
    };
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
      : null;
  const rangeLabel =
    from || to
      ? `${from ? fmtShort(from) : "the start"} to ${to ? fmtShort(to) : "today"}`
      : "the full record";
  const allTypes = types.size === LOG_TYPES.length;

  return (
    <div className="min-h-screen bg-surface-sunk">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .paper { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
          body { background: #fff !important; }
          @page { margin: 18mm 16mm; }
          .log-row, .keep { break-inside: avoid; }
        }
      `}</style>

      {/* ---- controls (screen only) ---- */}
      <div className="no-print sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/children/${id}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
            >
              <ArrowLeft size={15} /> Back
            </Link>
            <button
              onClick={() => window.print()}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-pine px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-btn)] hover:bg-pine-dark"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">Range</span>
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  preset === p.key
                    ? "border-pine bg-pine-soft text-pine-dark"
                    : "border-line-strong text-ink-soft hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
            <label className="ml-1 text-xs text-ink-soft">
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPreset("custom");
                  resetAiSummary();
                }}
                className="rounded border border-line-strong bg-surface px-1.5 py-1 text-xs"
              />
            </label>
            <span className="text-xs text-ink-faint">to</span>
            <label className="text-xs text-ink-soft">
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPreset("custom");
                  resetAiSummary();
                }}
                className="rounded border border-line-strong bg-surface px-1.5 py-1 text-xs"
              />
            </label>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">Include</span>
            {LOG_TYPES.map((t) => {
              const on = types.has(t.value);
              return (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    on
                      ? "border-pine bg-pine-soft text-pine-dark"
                      : "border-line-strong text-ink-faint line-through"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---- the document ---- */}
      <div className="mx-auto my-8 max-w-3xl">
        <div className="paper bg-surface px-10 py-12 shadow-sm sm:px-14">
          <header className="keep border-b border-line pb-5">
            <h1 className="text-2xl font-semibold text-ink">{child.name}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              Activity record
              {ageLabel(child.birth_year) ? ` · ${ageLabel(child.birth_year)}` : ""}
            </p>
            <p className="mt-3 text-xs text-ink-faint">
              Prepared {fmtLong(new Date().toLocaleDateString("en-CA"))} · {SITE.name}.
              An organizational record kept by the parent or caregiver — not a
              clinical assessment.
            </p>
          </header>

          {(child.focus_areas?.length || child.profile_notes) && (
            <section className="keep border-b border-line py-5">
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

          {/* summary */}
          <section className="keep border-b border-line py-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Summary
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Covers {rangeLabel}
              {!allTypes && (
                <> · limited to {[...types].map((v) => logType(v).label.toLowerCase()).join(", ")}</>
              )}
              .
            </p>
            {summary.total === 0 ? (
              <p className="mt-2 text-sm text-ink-faint">No entries match.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-ink">
                <li>
                  <span className="font-medium">{summary.total}</span>{" "}
                  {summary.total === 1 ? "entry" : "entries"} across{" "}
                  <span className="font-medium">{summary.days}</span>{" "}
                  {summary.days === 1 ? "day" : "days"}
                  {span && <span className="text-ink-soft"> ({span})</span>}
                </li>
                <li className="text-ink-soft">
                  {summary.byType.map((b) => `${b.n} ${b.label.toLowerCase()}`).join(", ")}
                </li>
                {summary.avgMood != null && (
                  <li className="text-ink-soft">
                    Mood noted on {summary.moodCount}{" "}
                    {summary.moodCount === 1 ? "entry" : "entries"}, averaging{" "}
                    {summary.avgMood}/5
                  </li>
                )}
              </ul>
            )}

            {aiStatus === "idle" && summary.total > 0 && (
              <button
                onClick={generateAiSummary}
                className="no-print mt-3 inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-pine hover:text-pine-dark"
              >
                <Sparkles size={13} /> Generate AI summary
              </button>
            )}
            {aiStatus === "loading" && (
              <p className="no-print mt-3 text-xs text-ink-faint">Writing a summary…</p>
            )}
            {aiStatus === "error" && (
              <div className="no-print mt-3 flex flex-wrap items-center gap-2">
                <p className="text-xs text-persimmon">{aiError}</p>
                <button
                  onClick={generateAiSummary}
                  className="text-xs font-medium text-pine-dark hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
            {aiStatus === "ok" && (
              <div className="keep mt-3 rounded-lg border border-line bg-surface-sunk px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-pine-dark">
                  AI-generated summary
                </p>
                <p className="mt-1.5 text-sm text-ink">{aiText}</p>
                <p className="mt-1.5 text-xs text-ink-faint">
                  Describes patterns in what was logged. Not a clinical assessment.
                </p>
              </div>
            )}
          </section>

          {/* documents on file */}
          {docs.length > 0 && (
            <section className="keep border-b border-line py-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
                Documents on file
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {docs.map((d) => (
                  <li key={d.id}>
                    {d.filename}
                    <span className="text-ink-faint">
                      {" "}
                      — {DOC_CATEGORY[d.category] || d.category}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-ink-faint">
                Held in {SITE.name}; not included in this printout.
              </p>
            </section>
          )}

          {/* entries */}
          <section className="py-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Entries
            </h2>
            {shown.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">No entries in this range.</p>
            ) : (
              <div className="mt-3 divide-y divide-line">
                {shown.map((log) => (
                  <div key={log.id} className="log-row grid grid-cols-[7rem_1fr] gap-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-ink">{fmtShort(log.date)}</div>
                      {timeOfDay(log.time_of_day) && (
                        <div className="text-xs text-ink-faint">
                          {timeOfDay(log.time_of_day).label}
                        </div>
                      )}
                      <div className="text-xs text-ink-faint">{logType(log.type).label}</div>
                    </div>
                    <div className="text-sm">
                      {log.practiced_items && <p className="text-ink">{log.practiced_items}</p>}
                      {log.notes && <p className="text-ink-soft">{log.notes}</p>}
                      {log.mood_rating != null && (
                        <p className="text-xs text-ink-faint">
                          Mood: {moodMeta(log.mood_rating)?.label} ({log.mood_rating}/5)
                        </p>
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
