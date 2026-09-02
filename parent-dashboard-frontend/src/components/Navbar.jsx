import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const linkClass = ({ isActive }) =>
  isActive
    ? "text-indigo-600"
    : "text-gray-600 hover:text-indigo-600 transition";

export default function Navbar() {
  const { isAuthenticated, parent, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-800 tracking-tight">
          Parent Dashboard
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          {isAuthenticated ? (
            <>
              <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
              <NavLink to="/logs" className={linkClass}>Logs</NavLink>
              <NavLink to="/documents" className={linkClass}>Documents</NavLink>
              <NavLink to="/ai-summary" className={linkClass}>AI Insights</NavLink>
              {parent?.email && (
                <span className="text-gray-400 hidden sm:inline">{parent.email}</span>
              )}
              <button
                onClick={handleLogout}
                className="ml-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-gray-600 hover:text-indigo-600 transition">
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
