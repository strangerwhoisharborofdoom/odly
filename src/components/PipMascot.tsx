import React from 'react';

export type PipMood = 'idle' | 'thinking' | 'talking' | 'beaming' | 'debating';

interface PipMascotProps {
  mood?: PipMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PipMascot: React.FC<PipMascotProps> = ({
  mood = 'idle',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
      aria-label={`Pip the Mascot (${mood})`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body gradient: Warm cozy cream with subtle blush */}
          <linearGradient id="pipBodyGrad" x1="20" y1="20" x2="100" y2="105" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF9F2" />
            <stop offset="0.7" stopColor="#FDEFE4" />
            <stop offset="1" stopColor="#F7DFD4" />
          </linearGradient>

          {/* Lightbulb glass gradient */}
          <linearGradient id="bulbGrad" x1="50" y1="10" x2="70" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFBEB" />
            <stop offset="0.5" stopColor="#FEF08A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="bulbGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient glow around antenna bulb */}
        <circle
          cx="60"
          cy="22"
          r={mood === 'thinking' ? 14 : mood === 'beaming' || mood === 'talking' ? 16 : 11}
          fill="#FEF08A"
          fillOpacity={mood === 'thinking' ? '0.4' : '0.55'}
          filter="url(#bulbGlow)"
          className={mood === 'thinking' ? 'animate-pulse' : ''}
        />

        {/* Antenna Stem */}
        <path
          d="M60 42 C60 36 60 30 60 27"
          stroke="#475569"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Antenna Lightbulb */}
        <g>
          {/* Bulb cap */}
          <rect x="56" y="27" width="8" height="4" rx="1.5" fill="#94A3B8" />
          {/* Glass teardrop/bulb */}
          <circle cx="60" cy="20" r="8" fill="url(#bulbGrad)" stroke="#EAB308" strokeWidth="1.5" />
          {/* Filament highlight */}
          <path
            d="M58 19 Q60 16 62 19"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Little spark rays when beaming or talking */}
          {(mood === 'beaming' || mood === 'talking') && (
            <>
              <line x1="60" y1="7" x2="60" y2="10" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="49" y1="12" x2="51" y2="14" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="71" y1="12" x2="69" y2="14" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* Feet */}
        <ellipse cx="46" cy="100" rx="8" ry="4.5" fill="#E2D1C3" />
        <ellipse cx="74" cy="100" rx="8" ry="4.5" fill="#E2D1C3" />

        {/* Pip Body: cute round dumpling creature */}
        <path
          d="M60 42 C84 42 98 56 98 76 C98 96 82 101 60 101 C38 101 22 96 22 76 C22 56 36 42 60 42 Z"
          fill="url(#pipBodyGrad)"
          stroke="#475569"
          strokeWidth="2.5"
        />

        {/* Belly soft patch */}
        <ellipse cx="60" cy="78" rx="22" ry="16" fill="#FFFFFF" fillOpacity="0.6" />

        {/* Cheeks: peach blush */}
        <circle cx="36" cy="75" r="5.5" fill="#FDA4AF" fillOpacity="0.65" />
        <circle cx="84" cy="75" r="5.5" fill="#FDA4AF" fillOpacity="0.65" />

        {/* Eyes according to mood */}
        {mood === 'beaming' ? (
          /* Joyful arcs ^ ^ */
          <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M43 68 Q48 62 53 68" />
            <path d="M67 68 Q72 62 77 68" />
          </g>
        ) : mood === 'thinking' ? (
          /* Looking up thoughtfully */
          <g>
            <circle cx="48" cy="64" r="4.5" fill="#334155" />
            <circle cx="72" cy="64" r="4.5" fill="#334155" />
            <circle cx="49.5" cy="62.5" r="1.5" fill="#FFFFFF" />
            <circle cx="73.5" cy="62.5" r="1.5" fill="#FFFFFF" />
            {/* Thoughtful brow */}
            <path d="M44 58 Q48 57 52 59" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M68 59 Q72 57 76 58" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'debating' ? (
          /* Inquisitive sharp look with tilted brow */
          <g>
            <circle cx="48" cy="67" r="4" fill="#334155" />
            <circle cx="72" cy="67" r="4" fill="#334155" />
            <circle cx="49" cy="65.5" r="1.4" fill="#FFFFFF" />
            <circle cx="73" cy="65.5" r="1.4" fill="#FFFFFF" />
            {/* Raised curious brow */}
            <path d="M44 59 Q48 56 52 59" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" fill="none" />
            <path d="M68 61 Q72 62 76 60" stroke="#475569" strokeWidth="1.75" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          /* Default alert, curious eyes */
          <g>
            <circle cx="48" cy="67" r="4.5" fill="#334155" />
            <circle cx="72" cy="67" r="4.5" fill="#334155" />
            <circle cx="49.5" cy="65.5" r="1.75" fill="#FFFFFF" />
            <circle cx="73.5" cy="65.5" r="1.75" fill="#FFFFFF" />
          </g>
        )}

        {/* Mouth */}
        {mood === 'talking' ? (
          <path
            d="M55 76 Q60 83 65 76 Z"
            fill="#E11D48"
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ) : mood === 'beaming' ? (
          <path
            d="M54 75 Q60 81 66 75"
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : mood === 'debating' ? (
          /* Small focused 'o' mouth */
          <ellipse cx="60" cy="76" rx="2.5" ry="3" fill="#E2E8F0" stroke="#334155" strokeWidth="1.8" />
        ) : (
          /* Gentle smile */
          <path
            d="M55 75 Q60 78 65 75"
            stroke="#334155"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Little hands */}
        <ellipse cx="30" cy="79" rx="4" ry="5" fill="#FDEFE4" stroke="#475569" strokeWidth="2" />
        <ellipse cx="90" cy="79" rx="4" ry="5" fill="#FDEFE4" stroke="#475569" strokeWidth="2" />
      </svg>
    </div>
  );
};
