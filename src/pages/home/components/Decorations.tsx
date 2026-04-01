export function RingsSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="40" cy="30" r="22" stroke="currentColor" strokeWidth="3.5" fill="none" opacity="0.7" />
      <circle cx="80" cy="30" r="22" stroke="currentColor" strokeWidth="3.5" fill="none" opacity="0.7" />
    </svg>
  );
}

export function FloralSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="40" cy="20" rx="8" ry="14" fill="currentColor" opacity="0.18" />
      <ellipse cx="40" cy="60" rx="8" ry="14" fill="currentColor" opacity="0.18" />
      <ellipse cx="20" cy="40" rx="14" ry="8" fill="currentColor" opacity="0.18" />
      <ellipse cx="60" cy="40" rx="14" ry="8" fill="currentColor" opacity="0.18" />
      <ellipse cx="26" cy="26" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(45 26 26)" />
      <ellipse cx="54" cy="26" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(-45 54 26)" />
      <ellipse cx="26" cy="54" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(-45 26 54)" />
      <ellipse cx="54" cy="54" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(45 54 54)" />
      <circle cx="40" cy="40" r="6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
