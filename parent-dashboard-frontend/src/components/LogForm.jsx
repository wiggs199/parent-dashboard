import { useState } from "react";
import { Button, Select, TextInput, Textarea, Field, Alert } from "./ui";
import { today, emptyLog, formToPayload } from "../lib/logForm";
import { LOG_TYPES, TIMES_OF_DAY, logType, mood as moodMeta } from "../lib/log";

function MoodPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const m = moodMeta(n);
        const Icon = m.Icon;
        const active = String(value) === String(n);
        return (
          <button
            key={n}
            type="button"
            aria-label={m.label}
            aria-pressed={active}
            onClick={() => onChange(active ? "" : String(n))}
            className={`rounded-lg p-1.5 transition-colors ${
              active ? "bg-surface-sunk" : "hover:bg-surface-sunk"
            }`}
          >
            <Icon
              size={22}
              strokeWidth={1.75}
              style={{ color: active ? m.color : "var(--color-ink-faint)" }}
            />
          </button>
        );
      })}
    </div>
  );
}

function TimeOfDayPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMES_OF_DAY.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? "" : v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-pine bg-pine-soft text-pine-dark"
                : "border-line-strong text-ink-soft hover:border-ink-faint hover:text-ink"
            }`}
          >
            <Icon size={15} strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function LogForm({ initial, submitLabel = "Save", onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyLog());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.date) {
      setFormError("Choose a date for this entry.");
      return;
    }
    if (form.date > today()) {
      setFormError("The date can't be in the future.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formToPayload(form));
      if (!onCancel) setForm(emptyLog()); // reset only in "create" mode
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <Alert>{formError}</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date">
          <TextInput
            type="date"
            max={today()}
            required
            value={form.date}
            onChange={setField("date")}
          />
        </Field>
        <Field label="Type" hint={logType(form.type).hint}>
          <Select value={form.type} onChange={setField("type")}>
            {LOG_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Time of day" hint="Optional">
        <TimeOfDayPicker
          value={form.time_of_day}
          onChange={(v) => set("time_of_day", v)}
        />
      </Field>

      <Field label="What happened">
        <TextInput
          placeholder="e.g. /s/ sounds, soccer, IEP meeting"
          value={form.practiced_items}
          onChange={setField("practiced_items")}
        />
      </Field>

      <Field label="Notes">
        <Textarea
          rows={3}
          placeholder="How it went, anything you want to remember…"
          value={form.notes}
          onChange={setField("notes")}
        />
      </Field>

      <Field label="Mood" hint="Optional">
        <MoodPicker value={form.mood_rating} onChange={(v) => set("mood_rating", v)} />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
