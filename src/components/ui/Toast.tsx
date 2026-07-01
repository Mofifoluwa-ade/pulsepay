'use client'

interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '-80px'})`,
        background: '#242424',
        border: '1px solid #333',
        borderRadius: 8,
        padding: '10px 18px',
        fontSize: 13,
        color: '#F0F0F0',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        whiteSpace: 'nowrap',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <span style={{ color: '#10b981' }}>✓</span>
      {message}
    </div>
  )
}
