import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FolderClosed, Download, Trash2, Upload, Pencil } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Button, Select, TextInput, Alert, EmptyState, Field } from "../components/ui";
import FilePreview from "../components/FilePreview";
import {
  listChildren,
  listDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
} from "../api/resources";
import { errorMessage } from "../api/client";

const MAX_BYTES = 10 * 1024 * 1024;

const CATEGORIES = [
  ["therapist", "Therapist"],
  ["school", "School / IEP"],
  ["insurance", "Insurance"],
  ["other", "Other"],
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES);

function fmtSize(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

const hasBasics = (child) =>
  child && child.birth_year != null && child.focus_areas?.length > 0;

function DocRow({ doc, onRename, onDelete, onDownload }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(doc.filename);
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === doc.filename) return setEditing(false);
    setBusy(true);
    try {
      await onRename(doc.id, trimmed);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <FolderClosed size={18} className="shrink-0 text-ink-faint" />
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
              setName(doc.filename);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{doc.filename}</p>
            <p className="text-xs text-ink-faint">
              {CATEGORY_LABEL[doc.category] || doc.category}
              {doc.size_bytes != null && ` · ${fmtSize(doc.size_bytes)}`}
            </p>
            {doc.uploaded_at && (
              <p className="mt-0.5 text-xs text-ink-faint">
                Uploaded {fmtDate(doc.uploaded_at)}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label={`Rename ${doc.filename}`}
            className="rounded-md p-1.5 text-ink-faint hover:bg-surface-sunk hover:text-ink"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDownload(doc)}
            aria-label={`Download ${doc.filename}`}
            className="rounded-md p-1.5 text-ink-faint hover:bg-surface-sunk hover:text-ink"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => onDelete(doc)}
            aria-label={`Delete ${doc.filename}`}
            className="rounded-md p-1.5 text-ink-faint hover:bg-persimmon-soft hover:text-persimmon"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
}

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("therapist");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(null); // File chosen but not yet uploaded
  const [pendingName, setPendingName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!pending) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(pending);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

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
    setLoading(true);
    setError("");
    setSearchParams({ child: String(childId) }, { replace: true });
    listDocuments(childId)
      .then(setDocs)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const activeChild = useMemo(
    () => children.find((c) => c.id === childId),
    [children, childId],
  );

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setError("");
    if (file.size === 0) return setError("That file is empty.");
    if (file.size > MAX_BYTES) return setError("Files must be 10 MB or smaller.");
    setPending(file);
    setPendingName(file.name);
  };

  const clearPending = () => {
    setPending(null);
    setPendingName("");
  };

  const handleUpload = async () => {
    if (!pending || !childId) return;
    setUploading(true);
    setError("");
    try {
      const doc = await uploadDocument(childId, category, pending, pendingName.trim());
      setDocs((prev) => [doc, ...prev]);
      clearPending();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete “${doc.filename}”? This can't be undone.`)) return;
    setError("");
    try {
      await deleteDocument(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDownload = async (doc) => {
    setError("");
    try {
      await downloadDocument(doc.id, doc.filename);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleRename = async (id, filename) => {
    setError("");
    try {
      const updated = await updateDocument(id, { filename });
      setDocs((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      setError(errorMessage(err));
      throw err;
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
        title="Documents"
        subtitle="Therapist, school, and insurance paperwork — kept per child."
        action={childPicker}
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {children.length === 0 ? (
        <EmptyState icon={FolderClosed} title="No children yet">
          Add a child on the dashboard first.
        </EmptyState>
      ) : !hasBasics(activeChild) ? (
        <Card elevated className="p-6">
          <p className="text-sm text-ink">
            Add {activeChild?.name}&rsquo;s birth year and at least one focus area
            before uploading documents.
          </p>
          <Link
            to={`/children/${childId}`}
            className="mt-3 inline-block text-sm font-medium text-pine-dark hover:underline"
          >
            Go to {activeChild?.name}&rsquo;s profile
          </Link>
        </Card>
      ) : (
        <>
          <Card elevated className="mb-8 p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              Upload{activeChild ? ` · ${activeChild.name}` : ""}
            </h2>

            <input
              ref={fileRef}
              type="file"
              onChange={pickFile}
              className="hidden"
            />

            {!pending ? (
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => fileRef.current?.click()}>
                  <Upload size={16} />
                  Choose a file
                </Button>
                <span className="text-xs text-ink-faint">
                  PDF, image, or document · up to 10 MB
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <FilePreview file={pending} url={previewUrl} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" hint="How it shows in the list">
                    <TextInput
                      value={pendingName}
                      onChange={(e) => setPendingName(e.target.value)}
                    />
                  </Field>
                  <Field label="Category">
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map(([v, label]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Uploading…" : "Upload this file"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    Choose a different file
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearPending}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {loading ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : docs.length === 0 ? (
            <EmptyState icon={FolderClosed} title="No documents yet">
              Upload the therapist reports, IEP paperwork, and insurance letters
              you want to keep with {activeChild?.name}.
            </EmptyState>
          ) : (
            <Card elevated className="divide-y divide-line">
              {docs.map((doc) => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                />
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
