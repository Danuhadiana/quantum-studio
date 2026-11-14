import React from 'react';

/**
 * Minimalist Clock Logo (Kuning Menuju Gelap)
 * Melambangkan presisi waktu, timeline timecode, dan keyframe video 60 FPS.
 */
export default function ClockLogo({ size = 28, className = "" }) {
  const uniqueId = React.useId ? React.useId().replace(/:/g, '') : 'clock-grad';
  const gradId = `yellow-to-dark-${uniqueId}`;
  const ringGradId = `ring-grad-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Quantum Studio Clock Logo"
    >
      <defs>
        {/* Gradien Kuning Surya Menuju Emas Gelap & Arang */}
        <linearGradient id={gradId} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />      {/* Yellow 200 */}
          <stop offset="25%" stopColor="#facc15" />     {/* Yellow 400 (Vibrant solar yellow) */}
          <stop offset="60%" stopColor="#ca8a04" />     {/* Yellow 600 (Deep warm gold) */}
          <stop offset="85%" stopColor="#78350f" />     {/* Amber 900 (Dark amber) */}
          <stop offset="100%" stopColor="#18181b" />    {/* Zinc 900 (Dark charcoal/black) */}
        </linearGradient>

        {/* Gradien Dial Luar */}
        <linearGradient id={ringGradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#71717a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#27272a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Outer Dial Circle with subtle border */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke={`url(#${ringGradId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Subtle Inner Sub-dial Ring */}
      <circle
        cx="24"
        cy="24"
        r="15"
        stroke="#27272a"
        strokeWidth="1"
        strokeDasharray="1.5 3"
      />

      {/* Minimalist Keyframe Tick Marks at 12, 3, 6, 9 */}
      <line x1="24" y1="6.5" x2="24" y2="9.5" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="41.5" y1="24" x2="38.5" y2="24" stroke="#a1a1aa" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="24" y1="41.5" x2="24" y2="38.5" stroke="#52525b" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="6.5" y1="24" x2="9.5" y2="24" stroke="#a1a1aa" strokeWidth="1.25" strokeLinecap="round" />

      {/* Hour Hand (Points toward 10 o'clock keyframe) */}
      <line
        x1="24"
        y1="24"
        x2="15"
        y2="15"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Minute Hand (Points toward 2 o'clock / timeline playhead) */}
      <line
        x1="24"
        y1="24"
        x2="33"
        y2="15"
        stroke={`url(#${gradId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Center Pivot Core (Glowing Amber Center Point) */}
      <circle cx="24" cy="24" r="2.75" fill="#facc15" />
      <circle cx="24" cy="24" r="1.25" fill="#18181b" />
    </svg>
  );
}
