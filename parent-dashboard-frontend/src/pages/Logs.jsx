import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

export default function Logs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState(null);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Load children once, then pick the active child from ?child= or the first one.
  useEffect(() => {
    listChildren()
      .then((data) => {
        setChildren(data);
        const wanted = Number(searchParams.get("child"));
        const initial =
          data.find((c) => c.id === wanted)?.id ?? data[0]?.id ?? null;
        setChildId(initial);
      })
      .catch((err) => setError(errorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload logs whenever the active child changes.
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
      const payload = {
        child_id: childId,
        date: form.date,
        type: form.type,
        practiced_items: form.practiced_items.trim() || null,
        mood_rating: form.mood_rating === "" ? null : Number(form.mood_rating),
        notes: form.notes.trim() || null,
      };
      const created = await createLog(payload);
      setLogs((prev) => [created, ...prev]);
      setForm(EMPTY_FORM());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (children.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Logs</h1>
        <p className="text-gray-500">
          {error || "Add a child on the dashboard first, then you can log activities here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-3xl font-bold text-gray-800">Logs</h1>
        <select
          value={childId ?? ""}
          onChange={(e) => setChildId(Number(e.target.value))}
          className="p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">
          {error}
        </div>
      )}

      {/* Add log */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-800">
          New log{activeChild ? ` for ${activeChild.name}` : ""}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="text-sm text-gray-600">
            Date
            <input
              type="date"
              value={form.date}
              onChange={setField("date")}
              max={TODAY()}
              required
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <label className="text-sm text-gray-600">
            Type
            <select
              value={form.type}
              onChange={setField("type")}
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="exercise">Exercise (tracking)</option>
              <option value="exploration">Exploration (reflection)</option>
            </select>
          </label>
          <label className="text-sm text-gray-600">
            Mood (1–5, optional)
            <input
              type="number"
              min="1"
              max="5"
              value={form.mood_rating}
              onChange={setField("mood_rating")}
              className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
        </div>

        <label className="block text-sm text-gray-600">
          Practiced items / activities
          <input
            type="text"
            value={form.practiced_items}
            onChange={setField("practiced_items")}
            placeholder="e.g. /s/ sounds, soccer drills"
            className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="block text-sm text-gray-600">
          Notes
          <textarea
            value={form.notes}
            onChange={setField("notes")}
            rows={3}
            placeholder="What happened, how it went…"
            className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add log"}
        </button>
      </form>

      {/* Log list */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {loadingLogs ? (
          <p className="p-6 text-gray-500">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="p-6 text-gray-500">No logs yet for this child.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{log.date}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    log.type === "exploration"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {log.type}
                </span>
              </div>
              {log.practiced_items && (
                <p className="text-gray-700 mt-1">{log.practiced_items}</p>
              )}
              {log.notes && <p className="text-gray-500 text-sm mt-1">{log.notes}</p>}
              {log.mood_rating != null && (
                <p className="text-gray-400 text-xs mt-1">Mood: {log.mood_rating}/5</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
