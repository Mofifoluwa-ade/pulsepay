'use client';

import React from 'react';

export function LogoIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`bg-[#C1121F] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden select-none ${className}`}>
      {/* EKG wave inside the red square */}
      <svg
        viewBox="0 0 100 100"
        className="w-7 h-7 text-white stroke-current fill-none"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M 10,50 L 30,50 L 38,40 L 44,60 L 50,50 L 56,15 L 64,85 L 70,50 L 76,55 L 82,50 L 90,50"
          style={{
            strokeDasharray: '200',
            strokeDashoffset: '200',
            animation: 'logo-ekg 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
        <style>{`
          @keyframes logo-ekg {
            0% { stroke-dashoffset: 200; }
            45% { stroke-dashoffset: 0; }
            55% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -200; }
          }
        `}</style>
      </svg>
    </div>
  );
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'stacked';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', layout = 'horizontal', showTagline = false }: LogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-4xl',
  };

  const wordmarkGap = {
    horizontal: size === 'sm' ? 'gap-2' : size === 'md' ? 'gap-3' : 'gap-4',
    stacked: 'gap-2 flex-col items-center text-center',
  };

  return (
    <div className={`flex ${layout === 'stacked' ? 'flex-col items-center' : 'items-center'} ${wordmarkGap[layout]}`}>
      <LogoIcon className={iconSizes[size]} />
      <div className={`flex flex-col justify-center ${layout === 'stacked' ? 'items-center text-center' : 'leading-none'}`}>
        <div className={`font-sans tracking-tight font-bold ${titleSizes[size]}`}>
          {layout === 'stacked' ? (
            <div className="flex flex-col leading-tight">
              <span className="text-[#F5F5F5]">Pulse</span>
              <span className="text-[#C1121F]">Pay</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[#F5F5F5]">Pulse</span>
              <span className="text-[#C1121F]">Pay</span>
            </div>
          )}
        </div>
        {showTagline && (
          <p className="text-[10px] md:text-xs text-[#b7b5b4] mt-1 font-mono tracking-widest uppercase">
            Payments at the speed of a heartbeat.
          </p>
        )}
      </div>
    </div>
  );
}
