import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <Sidebar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
