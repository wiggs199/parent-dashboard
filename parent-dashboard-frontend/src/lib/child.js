import { Speech, Hand, Dumbbell, Users, Brain, HeartHandshake, Sparkle } from "lucide-react";

// Suggested focus areas — the form offers these as toggles; custom ones are allowed too.
export const FOCUS_AREAS = [
  "Speech / language",
  "Occupational therapy",
  "Physical therapy",
  "Social skills",
  "Learning / academic",
  "Behavior",
];

// A colour + icon per area so a child's card has a fingerprint. Anything
// unlisted (a custom area) falls back to a neutral dot + a plain mark.
const FOCUS_COLORS = {
  "Speech / language": "#0f6b60",
  "Occupational therapy": "#d35c3b",
  "Physical therapy": "#3b83c9",
  "Social skills": "#7b6bd6",
  "Learning / academic": "#4f9b5f",
  Behavior: "#cf5f86",
  Feeding: "#d9a23a",
};

const FOCUS_ICONS = {
  "Speech / language": Speech,
  "Occupational therapy": Hand,
  "Physical therapy": Dumbbell,
  "Social skills": Users,
  "Learning / academic": Brain,
  Behavior: HeartHandshake,
};

export function focusColor(area) {
  return FOCUS_COLORS[area] || "#a89a86";
}

export function focusIcon(area) {
  return FOCUS_ICONS[area] || Sparkle;
}

export function ageLabel(birthYear) {
  if (!birthYear) return "";
  const age = new Date().getFullYear() - birthYear;
  if (age < 0 || age > 30) return "";
  return `Age ${age}`;
}
