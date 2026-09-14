// "Waypoint" — a calm line-art street that rises and narrows to the
// AntAriPath mark at the vanishing point. Pine line work (currentColor),
// theme-aware. A small, fixed-height graphic that sits in normal document
// flow above the tagline — not absolutely positioned or overlapping
// anything, on any screen size. (Was a full-bleed background behind the
// whole page at one point; that fought a tall form for space and got
// simplified down to this.)
export default function AuthIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="mx-auto h-28 w-auto text-pine"
      viewBox="0 0 480 600"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
    >
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
    </svg>
  );
}
