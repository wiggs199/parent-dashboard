import {
  Dumbbell,
  Palette,
  Stethoscope,
  Eye,
  Flag,
  Angry,
  Frown,
  Meh,
  Smile,
  Laugh,
  Sunrise,
  Sun,
  Sunset,
} from "lucide-react";

// The log "type" options — order here is the dropdown order.
export const LOG_TYPES = [
  {
    value: "home_practice",
    label: "Home practice",
    hint: "Exercises, therapy homework",
    color: "#0f6b60",
    Icon: Dumbbell,
  },
  {
    value: "activity",
    label: "Activity",
    hint: "Sports, art, play, outings",
    color: "#d35c3b",
    Icon: Palette,
  },
  {
    value: "appointment",
    label: "Appointment",
    hint: "A therapy session or doctor visit",
    color: "#3b83c9",
    Icon: Stethoscope,
  },
  {
    value: "observation",
    label: "Observation",
    hint: "Something you noticed",
    color: "#7b6bd6",
    Icon: Eye,
  },
  {
    value: "milestone",
    label: "Milestone or event",
    hint: "First day of school, a new therapist, a step forward or back",
    color: "#d9a23a",
    Icon: Flag,
  },
];

const BY_VALUE = Object.fromEntries(LOG_TYPES.map((t) => [t.value, t]));

const FALLBACK = {
  value: "",
  label: "Log",
  color: "#a89a86",
  Icon: Flag,
};

export const logType = (value) => BY_VALUE[value] || { ...FALLBACK, label: value || "Log" };

// Optional time-of-day. Order here is the picker order and the within-day sort.
export const TIMES_OF_DAY = [
  { value: "morning", label: "Morning", Icon: Sunrise },
  { value: "afternoon", label: "Afternoon", Icon: Sun },
  { value: "evening", label: "Evening", Icon: Sunset },
];

const TOD_RANK = { morning: 0, afternoon: 1, evening: 2 };
export const timeOfDay = (v) => TIMES_OF_DAY.find((t) => t.value === v) || null;
// unset sorts last within a day
export const timeOfDayRank = (v) => (v in TOD_RANK ? TOD_RANK[v] : 3);

// Mood 1-5 -> a face. Colour goes red-ish low, green-ish high, quiet in the middle.
const MOOD = {
  1: { Icon: Angry, label: "Very low", color: "#ad4522" },
  2: { Icon: Frown, label: "Low", color: "#d35c3b" },
  3: { Icon: Meh, label: "Okay", color: "#a89a86" },
  4: { Icon: Smile, label: "Good", color: "#3f9160" },
  5: { Icon: Laugh, label: "Great", color: "#0a5049" },
};

export const mood = (n) => MOOD[n] || null;
