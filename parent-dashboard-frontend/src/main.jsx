import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initSentry, Sentry } from "./lib/sentry";
import AppErrorFallback from "./components/AppErrorFallback";

initSentry();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
