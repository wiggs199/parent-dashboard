import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../api/resources";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import AuthShell from "../components/AuthShell";
import { Button, TextInput, Field, Alert } from "../components/ui";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { adoptToken } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setSubmitting(true);
    try {
      const { access_token } = await resetPassword(token, password);
      await adoptToken(access_token);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "This link is invalid or has expired."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      footer={
        <Link to="/login" className="font-medium text-sage-dark hover:underline">
          Back to sign in
        </Link>
      }
    >
      {!token ? (
        <Alert>
          This link is missing its token.{" "}
          <Link to="/forgot-password" className="underline">Request a new one</Link>.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="New password" hint="At least 8 characters">
            <TextInput
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm new password">
            <TextInput
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Set new password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
