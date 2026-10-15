import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  NotebookPen,
  FolderClosed,
  ArrowLeft,
  Trash2,
  Share2,
  Copy,
  Check,
  Plus,
  X,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Card, Button, TextInput, Textarea, Field, Alert } from "../components/ui";
import {
  getChild,
  updateChild,
  deleteChild,
  createHandoffLink,
  revokeHandoffLink,
} from "../api/resources";
import { errorMessage } from "../api/client";
import { FOCUS_AREAS, ageLabel, focusColor, focusIcon } from "../lib/child";

function Chip({ active, onClick, Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-pine bg-pine-soft text-pine-dark"
          : "border-line-strong text-ink-soft hover:border-ink-faint hover:text-ink"
      }`}
    >
      <Icon
        size={14}
        strokeWidth={2}
        style={{ color: active ? focusColor(children) : "currentColor" }}
      />
      {children}
    </button>
  );
}

function ProfileForm({ child, onSave, onCancel }) {
  const [name, setName] = useState(child.name);
  const [birthYear, setBirthYear] = useState(child.birth_year ? String(child.birth_year) : "");
  const [areas, setAreas] = useState(child.focus_areas || []);
  const [custom, setCustom] = useState("");
  const [notes, setNotes] = useState(child.profile_notes || "");
  const [helps, setHelps] = useState(child.handoff_helps || "");
  const [avoid, setAvoid] = useState(child.handoff_avoid || "");
  const [communication, setCommunication] = useState(child.handoff_communication || "");
  const [medical, setMedical] = useState(child.handoff_medical || "");
  const [contacts, setContacts] = useState(
    child.handoff_contacts?.length ? child.handoff_contacts : [{ name: "", phone: "" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateContact = (i, field, value) =>
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const addContact = () =>
    setContacts((prev) => (prev.length >= 4 ? prev : [...prev, { name: "", phone: "" }]));
  const removeContact = (i) => setContacts((prev) => prev.filter((_, idx) => idx !== i));

  const options = [...new Set([...FOCUS_AREAS, ...areas])];
  const toggle = (a) =>
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const addCustom = () => {
    const v = custom.trim();
    if (v && !areas.includes(v)) setAreas((prev) => [...prev, v]);
    setCustom("");
  };

  const thisYear = new Date().getFullYear();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const year = Number(birthYear);
    if (!year || year < 1990 || year > thisYear) {
      setError("Enter a valid birth year.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        birth_year: year,
        focus_areas: areas,
        profile_notes: notes.trim() || null,
        handoff_helps: helps.trim() || null,
        handoff_avoid: avoid.trim() || null,
        handoff_communication: communication.trim() || null,
        handoff_medical: medical.trim() || null,
        handoff_contacts: contacts
          .map((c) => ({ name: c.name.trim(), phone: c.phone.trim() }))
          .filter((c) => c.name && c.phone),
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Card elevated className="p-5">
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Birth year">
            <TextInput
              type="number"
              inputMode="numeric"
              required
              min="1990"
              max={thisYear}
              placeholder="e.g. 2018"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Focus areas</span>
          <div className="flex flex-wrap gap-2">
            {options.map((a) => (
              <Chip key={a} active={areas.includes(a)} onClick={() => toggle(a)} Icon={focusIcon(a)}>
                {a}
              </Chip>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <TextInput
              placeholder="Add another…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              className="max-w-[14rem]"
            />
            <Button type="button" variant="outline" onClick={addCustom} className="px-3 py-1.5">
              Add
            </Button>
          </div>
        </div>

        <Field label="Anything else about this child" hint="Optional — context that helps you keep track">
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Interests, what's working, who's involved…"
          />
        </Field>

        <div className="border-t border-line pt-5">
          <h3 className="font-display text-base font-semibold text-ink">Handoff card</h3>
          <p className="mt-1 text-sm text-ink-soft">
            A short, shareable reference for a sitter, substitute teacher, or
            anyone else looking after {child.name || "your child"} — not
            shown anywhere else in the app. All optional.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="What helps" hint="Calming strategies, favorite topics…">
              <Textarea rows={3} value={helps} onChange={(e) => setHelps(e.target.value)} />
            </Field>
            <Field label="What to avoid" hint="Triggers, sensitivities…">
              <Textarea rows={3} value={avoid} onChange={(e) => setAvoid(e.target.value)} />
            </Field>
            <Field label="Communication" hint="How they communicate, what to expect">
              <Textarea
                rows={3}
                value={communication}
                onChange={(e) => setCommunication(e.target.value)}
              />
            </Field>
            <Field label="Medical" hint="Allergies, medication, pediatrician">
              <Textarea rows={3} value={medical} onChange={(e) => setMedical(e.target.value)} />
            </Field>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-ink">Who to call</span>
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput
                    placeholder="Name"
                    value={c.name}
                    onChange={(e) => updateContact(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <TextInput
                    placeholder="Phone"
                    value={c.phone}
                    onChange={(e) => updateContact(i, "phone", e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    aria-label="Remove contact"
                    className="rounded-md p-2 text-ink-faint hover:bg-persimmon-soft hover:text-persimmon"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            {contacts.length < 4 && (
              <Button
                type="button"
                variant="ghost"
                onClick={addContact}
                className="mt-2 px-2 py-1 text-sm"
              >
                <Plus size={14} /> Add contact
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function HandoffShareCard({ child, onChange }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const url = child.handoff_token
    ? `${window.location.origin}/h/${child.handoff_token}`
    : null;

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const { token } = await createHandoffLink(child.id);
      onChange({ ...child, handoff_token: token });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!window.confirm("Turn off sharing? The current link will stop working.")) return;
    setBusy(true);
    setError("");
    try {
      await revokeHandoffLink(child.id);
      onChange({ ...child, handoff_token: null });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can fail quietly (older browsers, permissions) —
      // the link is still right there to select and copy manually.
    }
  };

  return (
    <Card elevated className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine-soft text-pine">
          <Share2 size={17} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-base font-semibold text-ink">Handoff card</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            A quick-reference link for a sitter, substitute teacher, or an ER
            visit — no login needed to view it.
          </p>

          {error && (
            <div className="mt-3">
              <Alert>{error}</Alert>
            </div>
          )}

          {url ? (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <TextInput readOnly value={url} className="flex-1 text-sm" />
                <Button type="button" variant="outline" onClick={copy} className="px-3">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-pine-dark hover:underline"
                >
                  Preview
                </a>
                <button
                  type="button"
                  onClick={revoke}
                  disabled={busy}
                  className="font-medium text-ink-faint hover:text-persimmon-dark"
                >
                  Turn off sharing
                </button>
              </div>
            </div>
          ) : (
            <Button type="button" onClick={create} disabled={busy} className="mt-3">
              {busy ? "Creating…" : "Create a shareable card"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ChildProfile() {
  // Remount on id change so the loading/child state starts fresh.
  const { id } = useParams();
  return <ChildProfileInner key={id} id={id} />;
}

function ChildProfileInner({ id }) {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | missing
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getChild(id)
      .then((data) => {
        if (cancelled) return;
        setChild(data);
        setState("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        setState(err?.response?.status === 404 ? "missing" : "ok");
        if (err?.response?.status !== 404) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async (patch) => {
    const updated = await updateChild(id, patch);
    setChild(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete ${child.name}? Their logs and documents will be removed too. This can't be undone.`,
      )
    )
      return;
    try {
      await deleteChild(id);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (state === "loading") return <p className="text-sm text-ink-soft">Loading…</p>;

  if (state === "missing") {
    return (
      <div>
        <PageHeader title="Child not found" />
        <Link to="/" className="text-sm font-medium text-pine-dark hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const age = ageLabel(child.birth_year);

  return (
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={15} /> Dashboard
      </Link>

      <PageHeader
        plain
        title={child.name}
        subtitle={age || undefined}
        action={
          !editing && (
            <div className="flex gap-2">
              <Link
                to={`/children/${child.id}/export`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunk"
              >
                Export
              </Link>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            </div>
          )
        }
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {editing ? (
        <ProfileForm child={child} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <div className="space-y-6">
          <Card elevated className="p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Focus areas
            </h2>
            {child.focus_areas?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {child.focus_areas.map((a) => {
                  const Icon = focusIcon(a);
                  return (
                    <span
                      key={a}
                      className="inline-flex items-center gap-2 rounded-full bg-surface-sunk px-3 py-1 text-sm text-ink-soft"
                    >
                      <Icon size={14} strokeWidth={2} style={{ color: focusColor(a) }} />
                      {a}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-faint">
                None set yet — add them from “Edit profile.”
              </p>
            )}

            <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Notes
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
              {child.profile_notes || (
                <span className="text-ink-faint">Nothing yet.</span>
              )}
            </p>
          </Card>

          <HandoffShareCard child={child} onChange={setChild} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to={`/logs?child=${child.id}`}
              className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-ink shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine-soft text-pine">
                <NotebookPen size={17} />
              </span>
              <span className="font-semibold">Logs</span>
            </Link>
            <Link
              to={`/documents?child=${child.id}`}
              className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-ink shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine-soft text-pine">
                <FolderClosed size={17} />
              </span>
              <span className="font-semibold">Documents</span>
            </Link>
          </div>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-persimmon-dark"
          >
            <Trash2 size={14} /> Delete this child
          </button>
        </div>
      )}
    </div>
  );
}
