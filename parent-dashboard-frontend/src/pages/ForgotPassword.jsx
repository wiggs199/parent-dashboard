import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/resources";
import { errorMessage } from "../api/client";
import AuthShell from "../components/AuthShell";
import { Button, TextInput, Field, Alert } from "../components/ui";
import { EMAIL_ENABLED } from "../lib/features";
import { SITE } from "../siteConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={!EMAIL_ENABLED || sent ? undefined : "We'll email you a link"}
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-sage-dark hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {!EMAIL_ENABLED ? (
        <p className="text-sm text-ink-soft">
          Self-serve password reset isn't available during this early trial.
          Email{" "}
          <a
            href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Password reset")}`}
            className="font-medium text-sage-dark hover:underline"
          >
            {SITE.contactEmail}
          </a>{" "}
          and we'll get you back in.
        </p>
      ) : sent ? (
        <p className="text-sm text-ink-soft">
          If that email has an account, a reset link is on its way. It expires in
          about an hour — check your spam folder if you don't see it.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Email">
            <TextInput
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
