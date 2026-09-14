// "Waypoint" — a calm line-art street that rises from the bottom and
// narrows to the AntAriPath mark at the vanishing point. Pine line work
// (currentColor). Theme-aware via tokens.
//
// Two ways it's used: `full` (default) is the desktop split-panel
// background — full-bleed, viewport-height, with a paper wash so it fades
// out where text sits. `compact` is a small, fully self-contained version
// for the mobile header — fixed height, no wash, never overlaps anything,
// since it sits in normal document flow above the tagline rather than
// behind it.
function Road() {
  return (
    <g opacity="0.55" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* the street leads to the mark — same four-point star as the logo,
          sitting at the vanishing point */}
      <g transform="translate(234.6 78.6) scale(0.45)" fill="currentColor" stroke="none" opacity="0.7">
        <path d="M12 1.5c.5 3.9 1.4 6.4 3.1 8.1 1.7 1.7 4.2 2.6 8.1 3.1v.6c-3.9.5-6.4 1.4-8.1 3.1-1.7 1.7-2.6 4.2-3.1 8.1h-.6c-.5-3.9-1.4-6.4-3.1-8.1-1.7-1.7-4.2-2.6-8.1-3.1v-.6c3.9-.5 6.4-1.4 8.1-3.1C10 7.9 10.9 5.4 11.4 1.5z" />
      </g>
      {/* street edges, wide at the base, converging straight ahead */}
      <path d="M20 600 Q 145 360 232 96" strokeWidth="2.8" />
      <path d="M460 600 Q 335 360 248 96" strokeWidth="2.8" />
      {/* lane line — steadier, more road-like rhythm than a dotted path */}
      <path d="M240 600 L 240 100" strokeWidth="2.4" strokeDasharray="16 13" />
    </g>
  );
}

export default function AuthIllustration({ compact = false }) {
  if (compact) {
    return (
      <svg
        aria-hidden="true"
        className="mx-auto h-28 w-auto text-pine"
        viewBox="0 0 480 600"
        fill="none"
        preserveAspectRatio="xMidYMax meet"
      >
        <Road />
      </svg>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute bottom-0 left-1/2 h-[90vh] max-h-[720px] min-h-[500px] w-[min(760px,120%)] -translate-x-1/2 text-pine"
        viewBox="0 0 480 600"
        fill="none"
        preserveAspectRatio="xMidYMax meet"
      >
        <Road />
      </svg>

      {/* paper wash: opaque through the header + card zone (top ~60% on any
          screen height), clearing toward the bottom so the street's base
          stays visible. A hint of transparency up top keeps the pine glow. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-paper) 9%, var(--color-paper) 56%, transparent 88%)",
        }}
      />
      {/* extra softening right behind the card centre */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(clamp(300px, 60vw, 460px) clamp(220px, 40vh, 380px) at 50% 42%, var(--color-paper) 30%, transparent 78%)",
        }}
      />
    </div>
  );
}
