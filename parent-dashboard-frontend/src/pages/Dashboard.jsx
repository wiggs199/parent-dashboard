import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Button, TextInput, Alert, EmptyState } from "../components/ui";
import { listChildren, createChild } from "../api/resources";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function ChildCard({ child }) {
  return (
    <Link
      to={`/logs?child=${child.id}`}
      className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-sunk"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-soft text-sm font-semibold text-sage-dark">
        {initials(child.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{child.name}</span>
        <span className="text-sm text-ink-soft">View logs</span>
      </span>
      <ArrowRight
        size={18}
        className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
      />
    </Link>
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
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
