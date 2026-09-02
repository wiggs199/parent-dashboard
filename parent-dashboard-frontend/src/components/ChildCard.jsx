import React from "react";

export default function ChildCard({ child, onAddLog, onUploadDoc, onView }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col justify-between cursor-pointer">
      <h2 className="text-xl font-bold mb-2 text-gray-800">{child.name}</h2>
      <p className="text-gray-600 mb-1">Logs: {child.logs}</p>
      <p className="text-gray-600 mb-4">Documents: {child.documents}</p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onAddLog(child.name)}
          className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium hover:bg-green-200 transition"
        >
          + Add Log
        </button>
        <button
          onClick={() => onUploadDoc(child.name)}
          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium hover:bg-blue-200 transition"
        >
          + Upload
        </button>
      </div>

      <button
        onClick={() => onView(child.name)}
        className="text-indigo-600 font-medium hover:underline"
      >
        View Details
      </button>
    </div>
  );
}



