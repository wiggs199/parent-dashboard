import React from "react";
import Navbar from "./Navbar";

export default function AppLayout({ children, loggedIn, setLoggedIn }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      {/* Page Content */}
      <main className="flex justify-center py-8 px-4">
        {/* Centered wrapper with max width */}
        <div className="w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

