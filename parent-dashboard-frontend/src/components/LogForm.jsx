import { useState } from "react";
import { Button, Select, TextInput, Textarea, Field } from "./ui";
import { today, emptyLog, formToPayload } from "../lib/logForm";

export default function LogForm({ initial, submitLabel = "Save", onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyLog());
  const [saving, setSaving] = useState(false);
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Date">
          <TextInput type="date" max={today()} required value={form.date} onChange={setField("date")} />
        </Field>
        <Field label="Type">
          <Select value={form.type} onChange={setField("type")}>
            <option value="exercise">Exercise (tracking)</option>
            <option value="exploration">Exploration (reflection)</option>
          </Select>
        </Field>
        <Field label="Mood" hint="Optional, 1–5">
          <TextInput
            type="number"
            min="1"
            max="5"
            value={form.mood_rating}
            onChange={setField("mood_rating")}
          />
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
      <div className="flex gap-2">
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
