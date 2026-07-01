import React from 'react'

interface PulseLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
}

const sizes = {
  sm: { mark: 28, radius: 8, iconW: 16, fontSize: 15 },
  md: { mark: 36, radius: 10, iconW: 20, fontSize: 18 },
  lg: { mark: 56, radius: 14, iconW: 30, fontSize: 26 },
}

export function PulseLogo({ size = 'md', showWordmark = true }: PulseLogoProps) {
  const s = sizes[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Mark */}
      <div
        style={{
          width: s.mark,
          height: s.mark,
          background: '#C1121F',
          borderRadius: s.radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={s.iconW}
          height={s.iconW}
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <polyline
            points="2,11 5,11 7,4 10,17 13,8 15,11 20,11"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontSize: s.fontSize,
              fontWeight: 600,
              color: '#F0F0F0',
              letterSpacing: '-0.01em',
            }}
          >
            Pulse<span style={{ color: '#C1121F' }}>Pay</span>
          </span>
        </div>
      )}
    </div>
  )
}
