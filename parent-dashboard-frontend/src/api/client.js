import axios from "axios";
import { getToken, clearToken } from "../auth/token";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({ baseURL });

// Attach the bearer token (if any) to every request.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is missing/expired/invalid, drop it and send the user to login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

// Pull a human-readable message out of an axios error for form display.
export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.response?.status === 429)
    return "Too many attempts. Wait a minute and try again.";
  if (error?.code === "ERR_NETWORK")
    return "Can't reach the server. Please check your connection and try again.";

  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail) && detail.length) {
    // FastAPI 422s: pick the most useful of the field errors, skip the
    // noisy "Input should be None" branch that comes from optional-union
    // fields, and name the field.
    const useful =
      detail.find((d) => d.msg && !/should be None/i.test(d.msg)) || detail[0];
    const field = Array.isArray(useful.loc) ? useful.loc[useful.loc.length - 1] : null;
    const msg = (useful.msg || "").replace(/^(Value error, |Assertion failed, )/, "");
    if (error.response.status === 422) {
      return field && field !== "body"
        ? `Please check the “${String(field).replace(/_/g, " ")}” field.`
        : msg || "Please check the form and try again.";
    }
    return msg || fallback;
  }

  return fallback;
}

export default client;
