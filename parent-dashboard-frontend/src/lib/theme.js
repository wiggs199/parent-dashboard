import { useCallback, useEffect, useState } from "react";

const KEY = "np_theme"; // "light" | "dark" | "system"

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(mode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  try {
    if (mode === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

// Cycles light -> dark -> system.
const NEXT = { light: "dark", dark: "system", system: "light" };

export function useTheme() {
  const [mode, setMode] = useState(read);

  useEffect(() => {
    apply(mode);
  }, [mode]);

  const cycle = useCallback(() => setMode((m) => NEXT[m]), []);
  return { mode, cycle };
}
