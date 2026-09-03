import { useState } from "react";
import { MailWarning, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { resendVerification } from "../api/resources";
import { EMAIL_ENABLED } from "../lib/features";

const DISMISS_KEY = "pd_verify_banner_dismissed";

function dismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export default function VerifyBanner() {
  const { parent } = useAuth();
  const [hidden, setHidden] = useState(dismissed);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  if (!EMAIL_ENABLED || !parent || parent.email_verified || hidden) return null;

  const hide = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  const resend = async () => {
    setStatus("sending");
    try {
      await resendVerification();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-b border-clay/30 bg-clay-soft">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-2.5 text-sm text-clay sm:px-8">
        <MailWarning size={16} className="shrink-0" />
        <p className="flex-1">
          {status === "sent"
            ? `Confirmation email sent to ${parent.email}.`
            : status === "error"
              ? "Couldn't send the email just now — try again in a bit."
              : `Confirm your email (${parent.email}) so you can recover your account later.`}
        </p>
        {status !== "sent" && (
          <button
            onClick={resend}
            disabled={status === "sending"}
            className="shrink-0 font-medium underline disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Resend"}
          </button>
        )}
        <button onClick={hide} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
