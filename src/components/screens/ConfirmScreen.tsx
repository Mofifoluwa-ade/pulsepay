'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { sendViaUniversalAccount } from '@/lib/particle'
import type { SendStep, StepStatus } from '@/types'

const INITIAL_STEPS: SendStep[] = [
  { id: 'routing', label: 'Routing cross-chain', status: 'idle' },
  { id: 'gas', label: 'Sponsoring gas', status: 'idle' },
  { id: 'settling', label: 'Settling on Arbitrum', status: 'idle' },
  { id: 'done', label: 'Done', status: 'idle' },
]

const STEP_DELAYS = [0, 900, 1700, 2500]

export function ConfirmScreen() {
  const { pendingSend, navigateTo, setPendingSend } = useApp()
  const [steps, setSteps] = useState<SendStep[]>(INITIAL_STEPS)
  const [phase, setPhase] = useState<'processing' | 'success'>('processing')
  const [ekgKey, setEkgKey] = useState(0)

  useEffect(() => {
    if (!pendingSend) return

    // Kick off mock send + step animation
    sendViaUniversalAccount('0xFROM', '0xTO', pendingSend.amount)

    function setStep(index: number, status: StepStatus) {
      setSteps(prev =>
        prev.map((s, i) => ({
          ...s,
          status:
            i === index
              ? status
              : i < index
              ? 'done'
              : 'idle',
        }))
      )
    }

    STEP_DELAYS.forEach((delay, i) => {
      setTimeout(() => {
        if (i < 3) setStep(i, 'active')
        else {
          setSteps(prev => prev.map(s => ({ ...s, status: 'done' })))
          setTimeout(() => {
            setPhase('success')
            setEkgKey(k => k + 1)
          }, 300)
        }
      }, delay)
    })

    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleDone() {
    setPendingSend(null)
    setPhase('processing')
    setSteps(INITIAL_STEPS)
    navigateTo('dashboard')
  }

  if (!pendingSend) return null

  return (
    <div className="screen-inner confirm-screen">
      {phase === 'processing' ? (
        <ProcessingView steps={steps} send={pendingSend} />
      ) : (
        <SuccessView send={pendingSend} onDone={handleDone} ekgKey={ekgKey} />
      )}
    </div>
  )
}

// ── Processing ────────────────────────────────────────
function ProcessingView({
  steps,
  send,
}: {
  steps: SendStep[]
  send: { toName: string; amount: number }
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="processing-ring" aria-hidden="true" />
      <p className="processing-text">Sending your payment</p>
      <p className="processing-sub">
        ${send.amount.toFixed(2)} USDC → {send.toName}
      </p>
      <div className="processing-steps">
        {steps.slice(0, 3).map(step => (
          <div
            key={step.id}
            className={`p-step ${step.status === 'done' ? 'done' : ''} ${
              step.status === 'active' ? 'active-step' : ''
            }`}
          >
            <div className="p-step-dot" aria-hidden="true" />
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Success ───────────────────────────────────────────
function SuccessView({
  send,
  onDone,
  ekgKey,
}: {
  send: { toEmail: string; toName: string; amount: number }
  onDone: () => void
  ekgKey: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Pulse rings */}
      <div className="pulse-rings" aria-hidden="true">
        <div className="pulse-ring" />
        <div className="pulse-ring" style={{ animationDelay: '0.4s' }} />
        <div className="pulse-ring" style={{ animationDelay: '0.8s' }} />
        <div className="success-check">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <p className="success-label">Sent.</p>
      <p className="success-amount">${send.amount.toFixed(2)} USDC</p>
      <p className="success-to">to {send.toEmail}</p>

      {/* EKG line — re-animates on each send */}
      <svg
        key={ekgKey}
        className="ekg-success"
        viewBox="0 0 320 36"
        fill="none"
        aria-hidden="true"
      >
        <polyline
          points="0,18 30,18 50,18 65,3 80,32 93,10 105,18 320,18"
          stroke="#C1121F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: 600,
            animation: 'ekg-draw 1s 0.3s ease forwards',
          }}
        />
      </svg>

      {/* Meta */}
      <div className="success-meta">
        {[
          { key: 'Amount', val: `$${send.amount.toFixed(2)} USDC` },
          { key: 'To', val: send.toEmail },
          { key: 'Network', val: 'Arbitrum One' },
          { key: 'Gas fee', val: 'Sponsored ✓', green: true },
          { key: 'Time', val: '~2 seconds' },
        ].map(row => (
          <div className="meta-row" key={row.key}>
            <span className="meta-key">{row.key}</span>
            <span
              className="meta-val"
              style={row.green ? { color: '#10b981' } : undefined}
            >
              {row.val}
            </span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onDone} style={{ marginBottom: 12 }}>
        Back to home
      </button>
      <button className="btn-ghost" onClick={() => alert('Receipt link copied')}>
        Share receipt
      </button>
    </div>
  )
}
