import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NotebookPen, Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Button, Select, TextInput, Textarea, Field, Alert, EmptyState } from "../components/ui";
import { listChildren, listLogs, createLog } from "../api/resources";
import { errorMessage } from "../api/client";

const TODAY = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = () => ({
  date: TODAY(),
  type: "exercise",
  practiced_items: "",
  mood_rating: "",
  notes: "",
});

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function TypeBadge({ type }) {
  const exploration = type === "exploration";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        exploration ? "bg-clay-soft text-clay" : "bg-sage-soft text-sage-dark"
      }`}
    >
      {type}
    </span>
  );
}

export default function Logs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listChildren()
      .then((data) => {
        setChildren(data);
        const wanted = Number(searchParams.get("child"));
        setChildId(data.find((c) => c.id === wanted)?.id ?? data[0]?.id ?? null);
      })
      .catch((err) => setError(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!childId) return;
    setLoadingLogs(true);
    setError("");
    setSearchParams({ child: String(childId) }, { replace: true });
    listLogs(childId)
      .then(setLogs)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingLogs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const activeChild = useMemo(
    () => children.find((c) => c.id === childId),
    [children, childId],
  );

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!childId) return;
    setSaving(true);
    setError("");
    try {
      const created = await createLog({
        child_id: childId,
        date: form.date,
        type: form.type,
        practiced_items: form.practiced_items.trim() || null,
        mood_rating: form.mood_rating === "" ? null : Number(form.mood_rating),
        notes: form.notes.trim() || null,
      });
      setLogs((prev) => [created, ...prev]);
      setForm(EMPTY_FORM());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const childPicker =
    children.length > 0 ? (
      <Select
        value={childId ?? ""}
        onChange={(e) => setChildId(Number(e.target.value))}
        className="sm:w-48"
      >
        {children.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>
    ) : null;

  return (
    <div>
      <PageHeader
        title="Logs"
        subtitle="A calm record of exercises and exploration, day by day."
        action={childPicker}
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {children.length === 0 ? (
        <EmptyState icon={NotebookPen} title="No children yet">
          Add a child on the dashboard first, then you can log activities here.
        </EmptyState>
      ) : (
        <>
          {/* Add log */}
          <Card className="mb-8 p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">
              New log{activeChild ? ` · ${activeChild.name}` : ""}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Date">
                  <TextInput type="date" max={TODAY()} required value={form.date} onChange={setField("date")} />
                </Field>
                <Field label="Type">
                  <Select value={form.type} onChange={setField("type")}>
                    <option value="exercise">Exercise (tracking)</option>
                    <option value="exploration">Exploration (reflection)</option>
                  </Select>
                </Field>
                <Field label="Mood" hint="Optional, 1–5">
                  <TextInput type="number" min="1" max="5" value={form.mood_rating} onChange={setField("mood_rating")} />
                </Field>
              </div>
              <Field label="Practiced items / activities">
                <TextInput
                  placeholder="e.g. /s/ sounds, soccer drills"
                  value={form.practiced_items}
                  onChange={setField("practiced_items")}
                />
              </Field>
              <Field label="Notes">
                <Textarea
                  rows={3}
                  placeholder="What happened, how it went…"
                  value={form.notes}
                  onChange={setField("notes")}
                />
              </Field>
              <Button type="submit" disabled={saving}>
                <Plus size={16} />
                {saving ? "Saving…" : "Add log"}
              </Button>
            </form>
          </Card>

          {/* Timeline */}
          {loadingLogs ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : logs.length === 0 ? (
            <EmptyState icon={NotebookPen} title="No logs yet">
              Add the first log above. Entries appear here newest first.
            </EmptyState>
          ) : (
            <ol className="relative space-y-6 border-l border-line pl-6">
              {logs.map((log) => (
                <li key={log.id} className="relative">
                  <span className="absolute -left-[1.6875rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-sage" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">{formatDate(log.date)}</span>
                    <TypeBadge type={log.type} />
                    {log.mood_rating != null && (
                      <span className="text-xs text-ink-faint">mood {log.mood_rating}/5</span>
                    )}
                  </div>
                  {log.practiced_items && (
                    <p className="mt-1 text-sm text-ink">{log.practiced_items}</p>
                  )}
                  {log.notes && (
                    <p className="mt-1 text-sm text-ink-soft">{log.notes}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
