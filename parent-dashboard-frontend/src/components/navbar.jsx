import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ loggedIn, setLoggedIn }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo / Brand */}
        <div className="text-lg font-semibold text-gray-800 tracking-tight">
          Parent Dashboard
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {loggedIn ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-indigo-600 transition"
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/logs"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-indigo-600 transition"
                }
              >
                Logs
              </NavLink>

              <NavLink
                to="/documents"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-indigo-600 transition"
                }
              >
                Documents
              </NavLink>

              <NavLink
                to="/ai-summary"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-indigo-600 transition"
                }
              >
                AI Insights
              </NavLink>

              <button
                onClick={() => setLoggedIn(false)}
                className="ml-4 bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-gray-600 hover:text-indigo-600 transition"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
