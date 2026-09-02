import React, { useState } from "react";
import ChildCard from "../components/ChildCard";

export default function Dashboard() {
  const [children] = useState([
    { id: 1, name: "Alice", logs: 5, documents: 2 },
    { id: 2, name: "Ben", logs: 3, documents: 1 },
  ]);

  const handleAddChild = () => alert("Add Child form placeholder");
  const handleAddLog = (childName) => alert(`Add Log for ${childName}`);
  const handleUploadDoc = (childName) =>
    alert(`Upload Document for ${childName}`);
  const handleViewDetails = (childName) =>
    alert(`View details for ${childName}`);

  const aiSummary =
    "This is a placeholder summary of your children's progress this week.";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Parent Dashboard
        </h1>
        <button
          onClick={handleAddChild}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          + Add Child
        </button>
      </div>

      {/* AI Summary */}
      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-md">
        <h2 className="font-semibold text-indigo-700 mb-2">AI Summary</h2>
        <p className="text-gray-700">{aiSummary}</p>
      </div>

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {children.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onAddLog={handleAddLog}
            onUploadDoc={handleUploadDoc}
            onView={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
