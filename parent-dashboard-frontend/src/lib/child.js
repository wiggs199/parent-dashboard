// Suggested focus areas — the form offers these as toggles; custom ones are allowed too.
export const FOCUS_AREAS = [
  "Speech / language",
  "Occupational therapy",
  "Physical therapy",
  "Social skills",
  "Learning / academic",
  "Behavior",
  "Feeding",
];

export function ageLabel(birthYear) {
  if (!birthYear) return "";
  const age = new Date().getFullYear() - birthYear;
  if (age < 0 || age > 30) return "";
  return `Age ${age}`;
}
