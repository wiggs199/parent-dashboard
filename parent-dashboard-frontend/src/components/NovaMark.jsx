// The NovaPath mark — two points on an ascending path that resolves into
// a star. Each logged day is a point; the record leads somewhere clear.
// Single-colour (currentColor) so it works in the pine badge, on paper,
// and in dark mode. Threads through the logo, the log timeline, and
// empty states.
export default function NovaMark({ size = 20, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 20 12.8 11.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="4" cy="20" r="1.7" fill="currentColor" />
      <circle cx="9" cy="15" r="1.7" fill="currentColor" />
      <path
        d="M15.5 1.8 Q17.36 6.14 21.7 8 Q17.36 9.86 15.5 14.2 Q13.64 9.86 9.3 8 Q13.64 6.14 15.5 1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}
