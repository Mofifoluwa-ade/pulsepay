'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from './AuthGate';
import { Mail, DollarSign } from 'lucide-react';
import TxStatus from './TxStatus';

export default function SendForm() {
  const { balance, universalAddress } = useUser();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendTxData, setSendTxData] = useState<{ toEmail: string; amount: number; from: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const recipientParam = params.get('recipient') || params.get('email');
      const amountParam = params.get('amount');
      if (recipientParam) {
        setRecipient(recipientParam);
      }
      if (amountParam) {
        setAmount(amountParam);
      }
    }
  }, []);

  useEffect(() => {
    const handleQrScan = (e: Event) => {
      const customEvent = e as CustomEvent<{ value: string }>;
      if (customEvent.detail && customEvent.detail.value) {
        setRecipient(customEvent.detail.value);
      }
    };
    window.addEventListener('pulsepay-qr-scanned', handleQrScan);
    return () => window.removeEventListener('pulsepay-qr-scanned', handleQrScan);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || parseFloat(amount) <= 0) return;
    if (parseFloat(amount) > balance) {
      alert('Insufficient USDC balance.');
      return;
    }

    if (!universalAddress) {
      alert('Smart Account is resolving. Please wait.');
      return;
    }

    // Pass data to trigger the transaction process modal/screen
    setSendTxData({
      toEmail: recipient,
      amount: parseFloat(amount),
      from: universalAddress,
    });
    setIsSending(true);
  };

  const handleCloseStatus = () => {
    setIsSending(false);
    setSendTxData(null);
    setRecipient('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {!isSending ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-[#b7b5b4] text-xs font-mono uppercase tracking-widest">Payments</h2>
            <h1 className="font-sans text-2xl font-bold text-[#F5F5F5]">Send USD</h1>
          </div>

          <form 
            onSubmit={handleSubmit}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-[#C1121F]/[0.01] pointer-events-none" />

            {/* Recipient Input */}
            <div className="flex flex-col gap-2 relative z-10">
              <label htmlFor="send-recipient" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">
                Recipient Email
              </label>
              <div className="relative">
                <input 
                  id="send-recipient"
                  type="email" 
                  required
                  placeholder="name@email.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3.5 font-sans text-sm text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors pr-10"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b5b4]/40" />
              </div>
            </div>

            {/* Amount Input */}
            <div className="flex flex-col gap-2 relative z-10">
              <label htmlFor="send-amount" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b5b4]/40" />
                <input 
                  id="send-amount"
                  type="number" 
                  required
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-9 pr-16 py-3.5 font-sans text-sm text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setAmount(balance.toString())}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-[#C1121F] hover:underline cursor-pointer"
                >
                  MAX
                </button>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#b7b5b4]/50 px-1 mt-0.5">
                <span>Available Liquidity:</span>
                <span>${balance.toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Send Button */}
            <button 
              type="submit"
              className="w-full bg-[#C1121F] text-white font-sans text-sm font-semibold py-4 rounded-xl hover:bg-[#a00f1a] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg shadow-[#C1121F]/10 relative z-10"
            >
              <span>Send</span>
            </button>

            {/* Micro Tagline */}
            <div className="text-center font-mono text-[10px] tracking-wider text-[#b7b5b4]/40 pt-1 z-10">
              No fees · Instant · Cross-chain
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {sendTxData && (
            <TxStatus 
              toEmail={sendTxData.toEmail}
              amount={sendTxData.amount}
              from={sendTxData.from}
              onClose={handleCloseStatus}
            />
          )}
        </div>
      )}
    </div>
  );
}
