'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { MOCK_CONTACTS } from '@/lib/mockData'
import type { Contact } from '@/types'

export function SendScreen() {
  const { navigateTo, setPendingSend } = useApp()
  const [amount, setAmount] = useState('')
  const [recipientInput, setRecipientInput] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const isValid =
    parseFloat(amount) > 0 && (selectedContact !== null || recipientInput.includes('@'))

  function handleSelectContact(contact: Contact) {
    setSelectedContact(contact)
    setRecipientInput(contact.email)
  }

  function handleSend() {
    if (!isValid) return
    const toEmail = selectedContact?.email ?? recipientInput
    const toName = selectedContact?.name ?? toEmail
    setPendingSend({ toEmail, toName, amount: parseFloat(amount) })
    navigateTo('confirm')
  }

  return (
    <div className="screen-inner">
      {/* Back */}
      <button className="back-btn" onClick={() => navigateTo('dashboard')}>
        ← Back
      </button>

      <h2 className="screen-title">Send USDC</h2>
      <p className="screen-sub">Choose an amount and recipient.</p>

      {/* Amount */}
      <div className="amount-wrap">
        <span className="amount-prefix">$</span>
        <input
          className="amount-input"
          type="number"
          inputMode="decimal"
          placeholder="0"
          min="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          aria-label="Amount in USD"
        />
        <div className="amount-currency">USDC · Circle · Arbitrum</div>
      </div>

      {/* Recipient */}
      <div style={{ marginBottom: 16 }}>
        <label className="input-label">TO (EMAIL OR NAME)</label>
        <input
          className="pp-input"
          type="email"
          placeholder="friend@example.com"
          value={recipientInput}
          onChange={e => {
            setRecipientInput(e.target.value)
            setSelectedContact(null)
          }}
          aria-label="Recipient email"
        />
      </div>

      {/* Contacts */}
      <div className="section-label" style={{ marginBottom: 10 }}>CONTACTS</div>

      <div className="contact-list" role="listbox" aria-label="Contacts">
        {MOCK_CONTACTS.map(contact => (
          <button
            key={contact.id}
            className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
            onClick={() => handleSelectContact(contact)}
            role="option"
            aria-selected={selectedContact?.id === contact.id}
          >
            <div
              className="contact-avatar"
              style={{ background: contact.color, color: contact.textColor }}
              aria-hidden="true"
            >
              {contact.initials}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div className="contact-name">{contact.name}</div>
              <div className="contact-email">{contact.email}</div>
            </div>
            {selectedContact?.id === contact.id && (
              <div className="contact-check" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polyline
                    points="1.5,5 4,7.5 8.5,2.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ paddingTop: 16, flexShrink: 0 }}>
        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={!isValid}
          style={{ opacity: isValid ? 1 : 0.4, cursor: isValid ? 'pointer' : 'not-allowed' }}
        >
          Send Payment
        </button>
      </div>
    </div>
  )
}
