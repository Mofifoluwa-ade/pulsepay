'use client'

import { useApp } from '@/context/AppContext'
import { PulseLogo } from '@/components/ui/PulseLogo'
import { useEKG } from '@/hooks/useEKG'
import type { Transaction } from '@/types'

export function DashboardScreen() {
  const { user, balance, transactions, navigateTo } = useApp()
  const canvasRef = useEKG(true)

  function formatTime(date: Date): string {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins} min ago`
    if (hours < 24) return `${hours} hr ago`
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="screen-inner">
      {/* Header */}
      <div className="dash-header">
        <PulseLogo size="sm" />
        <div className="dash-avatar" aria-label="Profile">
          {user?.initials ?? 'PP'}
        </div>
      </div>

      {/* Balance card */}
      <div className="balance-card">
        <div className="balance-label">TOTAL BALANCE</div>
        <div className="balance-amount">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="balance-change">↑ +$120.00 today</div>
        {/* EKG ambient line */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: 48,
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="qa-btn" onClick={() => navigateTo('send')}>
          <span className="qa-icon">↗</span>
          <span className="qa-label">Send</span>
          <span className="qa-sub">To anyone by email</span>
        </button>
        <button className="qa-btn" onClick={() => alert('Share your payment link')}>
          <span className="qa-icon">↙</span>
          <span className="qa-label">Receive</span>
          <span className="qa-sub">Share your link</span>
        </button>
      </div>

      {/* Recent activity */}
      <div className="section-label">RECENT ACTIVITY</div>

      <div className="tx-list">
        {transactions.map(tx => (
          <TxRow key={tx.id} tx={tx} formatTime={formatTime} />
        ))}
      </div>

      {/* Bottom nav spacer */}
      <div style={{ height: 70, flexShrink: 0 }} />

      {/* Tab bar */}
      <nav className="tab-bar" aria-label="Main navigation">
        <button className="tab active" aria-current="page">
          <span className="tab-icon" aria-hidden="true">⊙</span>
          <span className="tab-label">HOME</span>
        </button>
        <button className="tab" onClick={() => navigateTo('send')}>
          <span className="tab-icon" aria-hidden="true">↗</span>
          <span className="tab-label">SEND</span>
        </button>
        <button className="tab">
          <span className="tab-icon" aria-hidden="true">≡</span>
          <span className="tab-label">ACTIVITY</span>
        </button>
        <button className="tab">
          <span className="tab-icon" aria-hidden="true">◎</span>
          <span className="tab-label">PROFILE</span>
        </button>
      </nav>
    </div>
  )
}

function TxRow({
  tx,
  formatTime,
}: {
  tx: Transaction
  formatTime: (d: Date) => string
}) {
  const isIn = tx.direction === 'received'
  return (
    <div className="tx-item">
      <div
        className="tx-avatar"
        style={{
          background: tx.counterparty.color,
          color: tx.counterparty.textColor,
        }}
        aria-hidden="true"
      >
        {tx.counterparty.initials}
      </div>
      <div className="tx-info">
        <div className="tx-name">{tx.counterparty.name}</div>
        <div className="tx-email">
          {tx.counterparty.email} · {formatTime(tx.timestamp)}
        </div>
      </div>
      <div className="tx-right">
        <div className={`tx-amount ${isIn ? 'in' : 'out'}`}>
          {isIn ? '+' : '−'}${tx.amount.toFixed(2)}
        </div>
        <div className="tx-time">{isIn ? 'Received' : 'Sent'}</div>
      </div>
    </div>
  )
}
