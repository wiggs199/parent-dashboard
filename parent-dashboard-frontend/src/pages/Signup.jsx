import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../api/client";
import AuthShell from "../components/AuthShell";
import { Button, TextInput, PasswordInput, Field, Alert } from "../components/ui";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError("The two email addresses don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await signup({ email: email.trim(), password, name: name.trim() });
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="One place for logs, documents, and notes"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-pine-dark hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Name" hint="Optional">
          <TextInput
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Confirm email">
          <TextInput
            type="email"
            required
            autoComplete="off"
            onPaste={(e) => e.preventDefault()}
            value={emailConfirm}
            onChange={(e) => setEmailConfirm(e.target.value)}
          />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <PasswordInput
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirm password">
          <PasswordInput
            required
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
