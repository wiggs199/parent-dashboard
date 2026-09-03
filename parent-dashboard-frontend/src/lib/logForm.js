export const today = () => new Date().toISOString().slice(0, 10);

export const emptyLog = () => ({
  date: today(),
  type: "exercise",
  practiced_items: "",
  mood_rating: "",
  notes: "",
});

// Turn an API log record into form values.
export const logToForm = (log) => ({
  date: log.date,
  type: log.type,
  practiced_items: log.practiced_items ?? "",
  mood_rating: log.mood_rating == null ? "" : String(log.mood_rating),
  notes: log.notes ?? "",
});

// Turn form values into an API payload.
export const formToPayload = (form) => ({
  date: form.date,
  type: form.type,
  practiced_items: form.practiced_items.trim() || null,
  mood_rating: form.mood_rating === "" ? null : Number(form.mood_rating),
  notes: form.notes.trim() || null,
});
