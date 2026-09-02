import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "Incorrect email or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Sign in to access your dashboard
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition-colors disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Login"}
          </button>
        </form>

        <div className="text-center mt-4 text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
