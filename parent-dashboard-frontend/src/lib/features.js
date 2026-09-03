// Transactional email only works once a sending domain is verified (Resend).
// Until then, hide the "confirm your email" / "reset password" surfaces so
// the app doesn't promise a message it can't send.
// Set VITE_EMAIL_ENABLED=true in .env.production once email is live.
export const EMAIL_ENABLED = import.meta.env.VITE_EMAIL_ENABLED === "true";
