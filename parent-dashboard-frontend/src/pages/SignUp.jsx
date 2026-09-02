import React from "react";
import { useNavigate } from "react-router-dom";

export default function Signup({ setLoggedIn }) {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setLoggedIn(true); // mock signup
    navigate("/"); // go to dashboard
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Create Account
        </h1>
        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4 text-gray-500 text-sm">
          Already have an account?{" "}
          <span
            className="text-indigo-600 font-medium cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}


