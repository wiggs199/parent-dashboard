// The NovaPath mark — a soft four-point star. Threads through the logo,
// the log timeline, and empty states.
export default function NovaMark({ size = 20, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5c.5 3.9 1.4 6.4 3.1 8.1 1.7 1.7 4.2 2.6 8.1 3.1v.6c-3.9.5-6.4 1.4-8.1 3.1-1.7 1.7-2.6 4.2-3.1 8.1h-.6c-.5-3.9-1.4-6.4-3.1-8.1-1.7-1.7-4.2-2.6-8.1-3.1v-.6c3.9-.5 6.4-1.4 8.1-3.1C10 7.9 10.9 5.4 11.4 1.5z" />
    </svg>
  );
}
