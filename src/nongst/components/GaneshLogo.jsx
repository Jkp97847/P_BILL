import React from 'react';

export default function GaneshLogo({
  showLogo = true,
  text = '॥ श्री गणेशाय नमः ॥',
  className = '',
  size = 'md'
}) {
  if (!showLogo) return null;

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold'
  };

  return (
    <div className={`flex flex-col items-center justify-center text-red-700 select-none ${className}`}>
      {/* Traditional Auspicious Ganesha SVG Symbol */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizes[size] || iconSizes.md} text-red-600 drop-shadow-xs mb-0.5`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tilak and Trishul / Ganesha Outline */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.4" />
        
        {/* Crown (Mukut) */}
        <path d="M42 20 L50 10 L58 20 L55 28 L45 28 Z" fill="currentColor" />
        <circle cx="50" cy="17" r="2.5" fill="#f59e0b" />

        {/* Mastak (Forehead) and Ears */}
        <path
          d="M32 30 C20 32, 18 48, 30 52 C35 53, 38 46, 40 40 C43 32, 57 32, 60 40 C62 46, 65 53, 70 52 C82 48, 80 32, 68 30 C60 27, 40 27, 32 30 Z"
          fill="currentColor"
        />

        {/* Trinetra / Red Tilak */}
        <path d="M48 26 C48 24, 52 24, 52 26 L52 35 C52 37, 48 37, 48 35 Z" fill="#f59e0b" />
        <circle cx="50" cy="38" r="2" fill="#ef4444" />

        {/* Trunk (Sund) turning gracefully to the right with Modak */}
        <path
          d="M46 40 C46 54, 44 65, 50 72 C55 77, 63 76, 65 70 C66 65, 60 62, 56 65 C54 67, 54 69, 57 69"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Auspicious Modak / Ladoo */}
        <circle cx="68" cy="66" r="3.5" fill="#f59e0b" />
        <circle cx="68" cy="66" r="1.5" fill="#b45309" />

        {/* Tusk (Dant) */}
        <path d="M42 48 L37 53 L41 54 Z" fill="#ffffff" />
      </svg>

      {/* Sacred Mantra / Slogan */}
      {text && (
        <span className={`tracking-wide text-red-800 font-serif ${textSizes[size] || textSizes.md}`}>
          {text}
        </span>
      )}
    </div>
  );
}
