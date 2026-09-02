import { Link } from "react-router-dom";

export default function ChildCard({ child }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-col justify-between">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{child.name}</h2>
      <div className="flex gap-2">
        <Link
          to={`/logs?child=${child.id}`}
          className="flex-1 text-center bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
        >
          View logs
        </Link>
      </div>
    </div>
  );
}
