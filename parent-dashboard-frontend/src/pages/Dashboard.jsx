import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Button, TextInput, Alert, EmptyState } from "../components/ui";
import {
  listChildren,
  getStats,
  createChild,
  updateChild,
  deleteChild,
} from "../api/resources";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ageLabel, focusColor } from "../lib/child";

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const firstName = (parent) =>
  parent?.name?.trim().split(/\s+/)[0] || parent?.email?.split("@")[0] || "there";

function ChildCard({ child, weekLogs, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === child.name) return setEditing(false);
    setBusy(true);
    try {
      await onRename(child.id, { name: trimmed });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <Card elevated className="p-4">
        <form onSubmit={save} className="flex items-center gap-2">
          <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Button type="submit" disabled={busy} className="px-3 py-1.5">Save</Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2 py-1.5"
            onClick={() => {
              setName(child.name);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </form>
      </Card>
    );
  }

  const areas = child.focus_areas ?? [];

  return (
    <Card
      elevated
      className="group relative flex flex-col gap-3 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pine-soft font-display text-[15px] font-semibold text-pine-dark">
          {initials(child.name)}
        </span>
        <Link to={`/children/${child.id}`} className="min-w-0 flex-1 pt-0.5">
          <span className="block truncate font-display text-lg font-semibold text-ink">
            {child.name}
          </span>
          <span className="text-xs text-ink-faint">
            {[ageLabel(child.birth_year), weekLogs != null && `${weekLogs} log${weekLogs === 1 ? "" : "s"} this week`]
              .filter(Boolean)
              .join(" · ") || "Set up profile"}
          </span>
        </Link>
        <div className="flex items-center gap-1 text-ink-faint opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            aria-label={`Rename ${child.name}`}
            className="rounded-lg p-1.5 hover:bg-surface-sunk hover:text-ink"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(child)}
            aria-label={`Delete ${child.name}`}
            className="rounded-lg p-1.5 hover:bg-persimmon-soft hover:text-persimmon-dark"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {areas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {areas.slice(0, 3).map((a) => (
            <span key={a} className="flex items-center gap-2 text-xs text-ink-soft">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: focusColor(a) }}
              />
              {a}
            </span>
          ))}
          {areas.length > 3 && (
            <span className="text-xs text-ink-faint">+{areas.length - 3} more</span>
          )}
        </div>
      )}

      <Link
        to={`/children/${child.id}`}
        className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-semibold text-pine-dark"
      >
        Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Card>
  );
}

function StatChip({ value, label }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-soft">
      <b className="text-sm font-bold text-ink">{value}</b>
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { parent } = useAuth();
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const refreshStats = () => getStats().then(setStats).catch(() => {});

  useEffect(() => {
    let cancelled = false;
    Promise.all([listChildren(), getStats().catch(() => null)])
      .then(([kids, s]) => {
        if (cancelled) return;
        setChildren(kids);
        setStats(s);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddChild = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError("");
    try {
      const child = await createChild(name);
      setChildren((prev) => [...prev, child]);
      setNewName("");
      refreshStats();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async (id, patch) => {
    setError("");
    try {
      const updated = await updateChild(id, patch);
      setChildren((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  };

  const handleDelete = async (child) => {
    if (
      !window.confirm(
        `Delete ${child.name}? Their logs and documents will be removed too. This can't be undone.`,
      )
    )
      return;
    setError("");
    try {
      await deleteChild(child.id);
      setChildren((prev) => prev.filter((c) => c.id !== child.id));
      refreshStats();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <PageHeader title={`Hi, ${firstName(parent)}`} subtitle={today} />

      {stats && (
        <div className="mb-7 flex flex-wrap gap-2">
          <StatChip value={stats.children} label={stats.children === 1 ? "child" : "children"} />
          <StatChip value={stats.logs_this_week} label="logs this week" />
          <StatChip value={stats.documents} label={stats.documents === 1 ? "document" : "documents"} />
        </div>
      )}

      <Card elevated className="mb-8 p-4">
        <form onSubmit={handleAddChild} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold text-ink sm:w-28">Add a child</span>
          <TextInput
            placeholder="Child's name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="sm:flex-1"
          />
          <Button type="submit" disabled={adding || !newName.trim()}>
            <Plus size={16} />
            {adding ? "Adding…" : "Add child"}
          </Button>
        </form>
      </Card>

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : children.length === 0 ? (
        <EmptyState title="No children yet">
          Add a child above to start keeping logs, documents, and notes in one place.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              weekLogs={stats?.per_child?.[String(child.id)] ?? null}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
