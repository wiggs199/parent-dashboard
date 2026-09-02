// Single place that knows where the auth token lives.
const KEY = "pd_token";

export function getToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* storage unavailable (private mode etc.) — session stays in memory only */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
