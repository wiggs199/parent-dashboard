import { today } from "./logForm";

const iso = (d) => d.toLocaleDateString("en-CA");

// The Sept 1 that starts the current US school year. Before this year's
// Sept 1, that's *last* year's — so the range is never in the future.
function schoolYearStart() {
  const now = new Date();
  const y = now.getFullYear();
  const start = now >= new Date(y, 8, 1) ? y : y - 1; // month 8 = September
  return `${start}-09-01`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
}

// Each preset returns { from, to } (empty string = unbounded).
export const RANGE_PRESETS = [
  { key: "all", label: "All", range: () => ({ from: "", to: "" }) },
  { key: "30", label: "Last 30 days", range: () => ({ from: daysAgo(30), to: today() }) },
  { key: "90", label: "Last 90 days", range: () => ({ from: daysAgo(90), to: today() }) },
  {
    key: "school",
    label: "This school year",
    range: () => ({ from: schoolYearStart(), to: today() }),
  },
];
