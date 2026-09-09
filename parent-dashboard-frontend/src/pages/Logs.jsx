import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Select, Alert, EmptyState } from "../components/ui";
import NovaMark from "../components/NovaMark";
import LogForm from "../components/LogForm";
import { logToForm } from "../lib/logForm";
import { logType, mood as moodMeta } from "../lib/log";
import { listChildren, listLogs, createLog, updateLog, deleteLog } from "../api/resources";
import { errorMessage } from "../api/client";

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function TypeBadge({ type }) {
  const t = logType(type);
  const Icon = t.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: `${t.color}1f`, color: t.color }}
    >
      <Icon size={12} strokeWidth={2.25} />
      {t.label}
    </span>
  );
}

function MoodFace({ n }) {
  const m = moodMeta(n);
  if (!m) return null;
  const Icon = m.Icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-faint" title={`Mood: ${m.label}`}>
      <Icon size={15} strokeWidth={1.75} style={{ color: m.color }} />
    </span>
  );
}

function TimelineEntry({ log, onEdit, onDelete }) {
  return (
    <li className="group relative">
      <NovaMark
        size={13}
        className="absolute -left-[1.72rem] top-1 bg-paper text-pine"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-ink">{formatDate(log.date)}</span>
        <TypeBadge type={log.type} />
        {log.mood_rating != null && <MoodFace n={log.mood_rating} />}
        <span className="row-actions ml-auto flex gap-3 text-xs text-ink-faint">
          <button onClick={onEdit} className="font-medium hover:text-ink">Edit</button>
          <button onClick={onDelete} className="font-medium hover:text-persimmon-dark">Delete</button>
        </span>
      </div>
      {log.practiced_items && <p className="mt-1 text-sm text-ink">{log.practiced_items}</p>}
      {log.notes && <p className="mt-1 text-sm text-ink-soft">{log.notes}</p>}
    </li>
  );
}

export default function Logs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

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
    setEditingId(null);
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

  const sortLogs = (list) =>
    [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));

  const handleCreate = async (payload) => {
    setError("");
    try {
      const created = await createLog({ ...payload, child_id: childId });
      setLogs((prev) => sortLogs([created, ...prev]));
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  };

  const handleUpdate = async (id, payload) => {
    setError("");
    try {
      const updated = await updateLog(id, payload);
      setLogs((prev) => sortLogs(prev.map((l) => (l.id === id ? updated : l))));
      setEditingId(null);
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log? This can't be undone.")) return;
    setError("");
    try {
      await deleteLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(errorMessage(err));
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
        subtitle="A calm record of what you're doing, day by day."
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
          <Card elevated className="mb-8 p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              New log{activeChild ? ` · ${activeChild.name}` : ""}
            </h2>
            <LogForm submitLabel="Add log" onSubmit={handleCreate} />
          </Card>

          {loadingLogs ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : logs.length === 0 ? (
            <EmptyState icon={NotebookPen} title="No logs yet">
              Add the first log above. Entries appear here newest first.
            </EmptyState>
          ) : (
            <ol className="relative space-y-6 border-l border-line pl-6">
              {logs.map((log) =>
                editingId === log.id ? (
                  <li key={log.id} className="relative">
                    <NovaMark size={13} className="absolute -left-[1.72rem] top-1 bg-paper text-persimmon" />
                    <Card elevated className="p-4">
                      <LogForm
                        initial={logToForm(log)}
                        submitLabel="Save changes"
                        onSubmit={(payload) => handleUpdate(log.id, payload)}
                        onCancel={() => setEditingId(null)}
                      />
                    </Card>
                  </li>
                ) : (
                  <TimelineEntry
                    key={log.id}
                    log={log}
                    onEdit={() => setEditingId(log.id)}
                    onDelete={() => handleDelete(log.id)}
                  />
                ),
              )}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
