import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, ArrowRight, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Button, TextInput, Alert, EmptyState } from "../components/ui";
import { listChildren, createChild, updateChild, deleteChild } from "../api/resources";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function ChildCard({ child, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === child.name) return setEditing(false);
    setBusy(true);
    try {
      await onRename(child.id, trimmed);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-soft text-sm font-semibold text-sage-dark">
        {initials(child.name)}
      </span>

      {editing ? (
        <form onSubmit={save} className="flex flex-1 items-center gap-2">
          <TextInput
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
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
      ) : (
        <>
          <Link to={`/logs?child=${child.id}`} className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">{child.name}</span>
            <span className="text-sm text-ink-soft">View logs</span>
          </Link>
          <div className="flex items-center gap-1 text-ink-faint opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button
              onClick={() => setEditing(true)}
              aria-label={`Rename ${child.name}`}
              className="rounded-md p-1.5 hover:bg-surface-sunk hover:text-ink"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(child)}
              aria-label={`Delete ${child.name}`}
              className="rounded-md p-1.5 hover:bg-clay-soft hover:text-clay"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <Link to={`/logs?child=${child.id}`} aria-hidden className="text-ink-faint">
            <ArrowRight size={18} />
          </Link>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { parent } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listChildren()
      .then((data) => !cancelled && setChildren(data))
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
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async (id, name) => {
    setError("");
    try {
      const updated = await updateChild(id, name);
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
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title={parent?.name ? `${parent.name}'s dashboard` : "Dashboard"}
        subtitle="An organizational space for what you're already doing — not therapy, diagnosis, or evaluation."
      />

      <Card className="mb-8 p-4">
        <form onSubmit={handleAddChild} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-ink sm:w-28">Add a child</span>
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
        <EmptyState icon={Users} title="No children yet">
          Add a child above to start keeping logs, documents, and notes in one place.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
