import { Speech, Hand, Dumbbell, Users, Brain, HeartHandshake, Sparkle } from "lucide-react";

// Suggested focus areas — the form offers these as toggles; custom ones are allowed too.
export const FOCUS_AREAS = [
  "Speech / Language",
  "Occupational Therapy",
  "Physical Therapy",
  "Social Skills",
  "Learning / Academic",
  "Behavior",
];

// A colour + icon per area so a child's card has a fingerprint. Anything
// unlisted (a custom area) falls back to a neutral dot + a plain mark.
// Keyed case-insensitively so older saved values (any casing) still match.
const FOCUS_COLORS = {
  "speech / language": "#0f6b60",
  "occupational therapy": "#d35c3b",
  "physical therapy": "#3b83c9",
  "social skills": "#7b6bd6",
  "learning / academic": "#4f9b5f",
  behavior: "#cf5f86",
  feeding: "#d9a23a",
};

const FOCUS_ICONS = {
  "speech / language": Speech,
  "occupational therapy": Hand,
  "physical therapy": Dumbbell,
  "social skills": Users,
  "learning / academic": Brain,
  behavior: HeartHandshake,
};

const norm = (area) => (area || "").trim().toLowerCase();

export function focusColor(area) {
  return FOCUS_COLORS[norm(area)] || "#a89a86";
}

export function focusIcon(area) {
  return FOCUS_ICONS[norm(area)] || Sparkle;
}

export function ageLabel(birthYear) {
  if (!birthYear) return "";
  const age = new Date().getFullYear() - birthYear;
  if (age < 0 || age > 30) return "";
  return `Age ${age}`;
}
