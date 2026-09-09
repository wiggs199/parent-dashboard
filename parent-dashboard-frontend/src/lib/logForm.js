// Local calendar date as YYYY-MM-DD (not UTC — matters near midnight in
// timezones behind UTC, where toISOString() would roll to tomorrow).
export const today = () => new Date().toLocaleDateString("en-CA");

export const emptyLog = () => ({
  date: today(),
  type: "home_practice",
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
