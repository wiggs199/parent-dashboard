export default function AppErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
      <p className="font-display text-xl text-ink">Something went wrong.</p>
      <p className="text-sm text-ink-soft">
        The error has been logged. Try reloading the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-pine-dark"
      >
        Reload
      </button>
    </div>
  );
}
