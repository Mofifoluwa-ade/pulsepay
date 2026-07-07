'use client';

import React from 'react';

interface EkgWaveProps {
  className?: string;
  color?: string;
  height?: number;
  speed?: number;
  strokeWidth?: number;
  glow?: boolean;
}

export default function EkgWave({
  className = '',
  color = '#C1121F',
  height = 80,
  speed = 2.5,
  strokeWidth = 2,
  glow = true,
}: EkgWaveProps) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '16px 16px',
        }}
      />
      
      {/* SVG EKG path */}
      <svg
        className="w-full h-full pointer-events-none"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
      >
        {glow && (
          <defs>
            <filter id="ekg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        
        <path
          d="M 0,50 L 80,50 L 100,50 L 110,50 L 115,42 L 122,50 L 128,50 L 134,10 L 142,90 L 148,50 L 156,50 L 163,55 L 170,50 L 250,50 L 270,50 L 280,50 L 285,42 L 292,50 L 298,50 L 304,10 L 312,90 L 318,50 L 326,50 L 333,55 L 340,50 L 400,50"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={glow ? 'url(#ekg-glow)' : undefined}
          style={{
            strokeDasharray: '1000',
            strokeDashoffset: '1000',
            animation: `ekg-dash ${speed}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          }}
        />
      </svg>
      
      <style>{`
        @keyframes ekg-dash {
          0% {
            stroke-dashoffset: 1000;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
}
