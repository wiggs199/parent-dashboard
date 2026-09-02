import { useEffect, useState } from "react";
import ChildCard from "../components/ChildCard";
import { listChildren, createChild } from "../api/resources";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          {parent?.name ? `${parent.name}'s Dashboard` : "Parent Dashboard"}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          An organizational support tool — not therapy, diagnosis, or progress evaluation.
        </p>
      </div>

      <form
        onSubmit={handleAddChild}
        className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center"
      >
        <label className="font-medium text-gray-700 sm:w-32">Add a child</label>
        <input
          type="text"
          placeholder="Child's name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {adding ? "Adding…" : "+ Add Child"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : children.length === 0 ? (
        <p className="text-gray-500">No children yet. Add one above to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
