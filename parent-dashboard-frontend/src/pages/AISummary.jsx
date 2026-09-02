import React from "react";

export default function AISummary() {
  const aiSummary =
    "This is a placeholder AI summary of your children's progress. Later, AI will generate real insights!";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">AI Summary</h1>
      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-md shadow-sm">
        <p className="text-gray-700">{aiSummary}</p>
      </div>
    </div>
  );
}
