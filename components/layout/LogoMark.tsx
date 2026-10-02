/** The document mark. Plain SVG so it renders in the DOM, in OG images and in icons alike. */
export function LogoMark({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d="M6 3.5h7.2L19 9.3V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13 3.5V9a.5.5 0 0 0 .5.5H19"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 13.5h6M9 16.5h4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
