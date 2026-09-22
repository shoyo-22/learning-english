"use client";
import { useId } from "react";
/**
 * Union Jack drawn to the official 1:2 construction. The counterchanged red
 * saltire needs a clip path, so each instance gets its own id — two of these
 * render on the home page.
 */
export function UnionJack({
  width = 24,
  className,
}: {
  width?: number;
  className?: string;
}) {
  const clip = `union-jack-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox="0 0 60 30"
      width={width}
      height={width / 2}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id={clip}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${clip})`}
        stroke="#c8102e"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}
