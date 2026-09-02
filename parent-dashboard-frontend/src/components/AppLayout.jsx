import Navbar from "./Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex justify-center py-8 px-4">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
