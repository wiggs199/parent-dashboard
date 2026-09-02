import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmail } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import AuthShell from "../components/AuthShell";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { isAuthenticated, refreshParent } = useAuth();
  // verifying | done | error — starts at "error" when there's no token at all
  const [state, setState] = useState(token ? "verifying" : "error");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;
    verifyEmail(token)
      .then(() => {
        setState("done");
        refreshParent().catch(() => {});
      })
      .catch(() => setState("error"));
  }, [token, refreshParent]);

  const back = isAuthenticated ? "/" : "/login";
  const backLabel = isAuthenticated ? "Go to dashboard" : "Sign in";

  return (
    <AuthShell title="Email confirmation">
      {state === "verifying" && (
        <p className="text-sm text-ink-soft">Confirming your email…</p>
      )}
      {state === "done" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="text-sage" size={32} />
          <p className="text-sm text-ink">Your email is confirmed.</p>
          <Link to={back} className="text-sm font-medium text-sage-dark hover:underline">
            {backLabel}
          </Link>
        </div>
      )}
      {state === "error" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <XCircle className="text-clay" size={32} />
          <p className="text-sm text-ink">
            This confirmation link is invalid or has expired.
          </p>
          <p className="text-sm text-ink-soft">
            {isAuthenticated
              ? "You can send a new one from the banner on your dashboard."
              : "Sign in and we'll offer you a fresh link."}
          </p>
          <Link to={back} className="text-sm font-medium text-sage-dark hover:underline">
            {backLabel}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
