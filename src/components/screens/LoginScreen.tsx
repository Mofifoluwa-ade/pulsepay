'use client'

import { useState } from 'react'
import { PulseLogo } from '@/components/ui/PulseLogo'
import { useApp } from '@/context/AppContext'
import { loginWithEmail } from '@/lib/magic'
import type { User } from '@/types'

export function LoginScreen() {
  const { setUser, navigateTo } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    try {
      // Real: await loginWithEmail(email) — Magic sends OTP
      // Mock for prototype:
      await new Promise(r => setTimeout(r, 800))
      const initials = email.slice(0, 2).toUpperCase()
      const user: User = { email, address: '0xMOCK...', initials }
      setUser(user)
      navigateTo('dashboard')
    } catch (e) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-inner">
      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <PulseLogo size="md" />

        <h1 className="login-headline">
          Money moves at<br />
          the speed of a<br />
          <span style={{ color: '#C1121F' }}>heartbeat.</span>
        </h1>
        <p className="login-sub">
          Send USDC to anyone by email.<br />
          No wallet. No gas. No chain.
        </p>

        {/* Email input */}
        <div style={{ marginBottom: 12 }}>
          <label className="input-label">EMAIL ADDRESS</label>
          <input
            className="pp-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="email"
            disabled={loading}
          />
          {error && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{error}</p>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ marginBottom: 16 }}
        >
          {loading ? 'Signing in...' : 'Continue'}
        </button>

        <div className="divider">or</div>

        {/* Google */}
        <button
          className="btn-google"
          onClick={handleLogin}
          disabled={loading}
          style={{ marginBottom: 16 }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="login-footer">
          Powered by Magic · Particle Network · Arbitrum<br />
          Your assets, your keys. Always.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
