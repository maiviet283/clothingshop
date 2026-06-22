interface LogoProps {
  /** Show the wordmark next to the emblem. */
  withText?: boolean;
  className?: string;
  size?: number;
}

/**
 * TORANO brand mark — an angular faceted "T" monogram inside a sharp shield.
 * Uses `currentColor` for the linework and the brass accent token for the bar,
 * so it adapts to light/dark themes automatically.
 */
export function Logo({ withText = true, className, size = 34 }: LogoProps) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Faceted shield */}
        <path
          d="M24 2 L44 11 V27 Q44 39 24 46 Q4 39 4 27 V11 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Monogram T — crossbar in accent, stem in ink */}
        <path d="M14 16 H34" stroke="var(--accent)" strokeWidth="3.4" strokeLinecap="square" />
        <path d="M24 16 V34" stroke="currentColor" strokeWidth="3.4" strokeLinecap="square" />
        {/* Facet accents */}
        <path d="M24 2 L24 16 M4 11 L14 16 M44 11 L34 16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
      {withText && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '1.32rem',
            letterSpacing: '0.22em',
            lineHeight: 1,
            paddingLeft: 2,
          }}
        >
          TORANO
        </span>
      )}
    </span>
  );
}
