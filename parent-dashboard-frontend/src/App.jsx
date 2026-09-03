import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import ChildProfile from "./pages/ChildProfile";
import ExportView from "./pages/ExportView";
import Logs from "./pages/Logs";
import Documents from "./pages/Documents";
import AISummary from "./pages/AISummary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="/" element={<Protected><Dashboard /></Protected>} />
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
          <Route path="/ai-summary" element={<Protected><AISummary /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
