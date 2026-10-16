import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/AuthContext";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import ChildProfile from "./pages/ChildProfile";
import ExportView from "./pages/ExportView";
import Logs from "./pages/Logs";
import Documents from "./pages/Documents";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HandoffCard from "./pages/HandoffCard";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

// "/" is the one route that isn't purely public or purely gated: signed-in
// visitors get the real Dashboard, signed-out visitors get the public
// landing page instead of being bounced straight to a bare login form.
function Root() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-ink-soft">
        Loading…
      </div>
    );
  }
  return isAuthenticated ? (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ) : (
    <Landing />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/h/:token" element={<HandoffCard />} />

          <Route path="/" element={<Root />} />
          <Route path="/children/:id" element={<Protected><ChildProfile /></Protected>} />
          <Route
            path="/children/:id/export"
            element={
              <ProtectedRoute>
                <ExportView />
              </ProtectedRoute>
            }
          />
          <Route path="/logs" element={<Protected><Logs /></Protected>} />
          <Route path="/documents" element={<Protected><Documents /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
