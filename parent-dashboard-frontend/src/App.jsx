import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Documents from "./pages/Documents";
import AISummary from "./pages/AISummary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/signup" element={<Signup setLoggedIn={setLoggedIn} />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <AppLayout loggedIn={loggedIn} setLoggedIn={setLoggedIn}>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <AppLayout loggedIn={loggedIn} setLoggedIn={setLoggedIn}>
                <Logs />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <AppLayout loggedIn={loggedIn} setLoggedIn={setLoggedIn}>
                <Documents />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-summary"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <AppLayout loggedIn={loggedIn} setLoggedIn={setLoggedIn}>
                <AISummary />
              </AppLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

