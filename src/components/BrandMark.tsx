// The nav's identity mark — a monogram, not the plain word "Naya".
//
// Drawn inline as SVG rather than loaded from /public so it inherits the
// page's own tokens: the ring and the N's uprights ride on `currentColor`
// (so they flip with light/dark), and only the diagonal carries the accent.
// To swap in a supplied logo file later, replace the <svg> below with an
// <Image src="/images/logo.svg" …> — the wrapper, sizing, and the
// accessible name around it stay as they are.
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-hidden
      className={`h-9 w-9 ${className}`}
      fill="none"
    >
      <circle
        cx="20"
        cy="20"
        r="18.25"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      {/* N — two uprights in the page's foreground colour, the diagonal in
          accent so the mark still reads as one letter but carries the
          site's clay highlight through it. */}
      <path
        d="M13.5 27.5V12.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M26.5 27.5V12.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M13.5 12.5L26.5 27.5"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* The dot of the "i" in Naya's signature — a small accent bead that
          keeps the circle from reading as a generic avatar ring. */}
      <circle cx="30.5" cy="11.5" r="2" fill="var(--accent)" />
    </svg>
  );
}
