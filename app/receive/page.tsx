'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useUser } from '../../components/AuthGate';
import { QrCode, Copy, Check, Info, X, DollarSign } from 'lucide-react';

export default function ReceivePage() {
  const { email, universalAddress } = useUser();
  const [copied, setCopied] = useState(false);

  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestRecipient, setRequestRecipient] = useState('');
  const [requestRecipientType, setRequestRecipientType] = useState<'email' | 'friend'>('email');
  const [generatedRequestLink, setGeneratedRequestLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load friends from localStorage
  const loadFriends = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('pulsepay_friends');
        const list = stored ? JSON.parse(stored) : [];
        setFriends(list);
      } catch (e) {
        console.error('Error loading friends list:', e);
      }
    }
  };

  const handleOpenRequestModal = () => {
    loadFriends();
    setRequestAmount('');
    setRequestRecipient('');
    setRequestRecipientType('email');
    setGeneratedRequestLink('');
    setIsRequestModalOpen(true);
  };

  const handleGenerateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount || parseFloat(requestAmount) <= 0) return;

    let targetEmail = '';
    if (requestRecipientType === 'email') {
      targetEmail = requestRecipient.trim().toLowerCase();
    } else {
      targetEmail = requestRecipient.toLowerCase();
    }

    if (!targetEmail) return;

    // Use current user's email as the requester
    const requesterEmail = email || '';
    
    // Generate the deep-link URL pointing to the Send page
    const requestLink = `${window.location.origin}/send?recipient=${encodeURIComponent(requesterEmail)}&amount=${encodeURIComponent(requestAmount)}`;
    setGeneratedRequestLink(requestLink);
  };

  const handleCopy = () => {
    if (universalAddress) {
      navigator.clipboard.writeText(universalAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Generate QR Code URL from universalAddress using the public qrserver API
  const qrCodeUrl = universalAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(universalAddress)}&margin=10`
    : '';

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 py-4 text-center select-none">
        
        {/* Page Header */}
        <div className="space-y-1">
          <h2 className="text-[#b7b5b4] text-xs font-mono uppercase tracking-widest">Receive Assets</h2>
          <h1 className="font-sans text-2xl font-bold text-[#F5F5F5] flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6 text-[#C1121F]" />
            <span>Receive USDC</span>
          </h1>
        </div>

        {/* Core QR Code Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,18,31,0.02)_0%,transparent_60%)] pointer-events-none" />

          {/* User Email on Top */}
          <div className="space-y-1 relative z-10">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">PulsePay Account</span>
            <h2 className="text-sm font-mono text-[#F5F5F5] font-semibold truncate max-w-[280px]">
              {email || 'loading...'}
            </h2>
          </div>

          {/* QR Code Container (White BG for Scanner Contrast) */}
          <div className="relative z-10 w-48 h-48 bg-white border border-[#2A2A2A] rounded-2xl p-4 flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] duration-300">
            {qrCodeUrl ? (
              <>
                <img 
                  src={qrCodeUrl} 
                  alt="Smart Account QR Code" 
                  className="w-full h-full select-none"
                  draggable="false"
                />
                {/* Embedded Logo Mark in the absolute center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-md">
                  <div className="w-8 h-8 bg-[#C1121F] rounded-lg flex items-center justify-center overflow-hidden">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-5.5 h-5.5 text-white stroke-current fill-none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 10,50 L 30,50 L 38,40 L 44,60 L 50,50 L 56,15 L 64,85 L 70,50 L 76,55 L 82,50 L 90,50" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-gray-400">
                Generating...
              </div>
            )}
          </div>

          {/* Address Display & Copy Widget */}
          <div className="w-full space-y-2 relative z-10">
            <span className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/40">Your Smart Account Address</span>
            <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3">
              <span className="font-mono text-xs text-[#F5F5F5] truncate mr-4">
                {universalAddress || 'Resolving...'}
              </span>
              <button 
                onClick={handleCopy}
                disabled={!universalAddress}
                className="text-[#b7b5b4]/40 hover:text-[#C1121F] disabled:opacity-40 transition-colors cursor-pointer flex-shrink-0"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Request Payment Trigger Button */}
          <button
            onClick={handleOpenRequestModal}
            className="w-full bg-[#C1121F] hover:bg-[#a00f1a] text-white font-sans text-xs font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C1121F]/10 relative z-10 mt-2"
          >
            <span>Request Payment</span>
          </button>

          {/* Network Notice */}
          <div className="flex items-start gap-2 text-left bg-[#0A0A0A]/50 border border-[#2A2A2A]/40 rounded-xl p-3.5 w-full relative z-10">
            <Info className="w-4 h-4 text-[#C1121F] flex-shrink-0 mt-0.5" />
            <div className="font-mono text-[9px] text-[#b7b5b4]/60 uppercase tracking-wide leading-relaxed">
              Accepts USDC deposits directly on the Arbitrum Sepolia Testnet. Gas sponsoring is enabled on inbound settlements.
            </div>
          </div>

        </div>

      </div>

      {/* Request Payment Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">Request Assets</span>
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="text-[#b7b5b4]/60 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!generatedRequestLink ? (
              <form onSubmit={handleGenerateRequest} className="space-y-4 text-left">
                {/* Amount input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="req-amount" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">
                    Amount (USDC)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b5b4]/40" />
                    <input 
                      id="req-amount"
                      type="number" 
                      required
                      step="any"
                      placeholder="0.00"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-8 pr-4 py-3 font-sans text-xs text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors"
                    />
                  </div>
                </div>

                {/* Recipient Mode Selection (Email / Friend) */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4] block">From</span>
                  <div className="flex gap-2 bg-[#0A0A0A] border border-[#2A2A2A] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setRequestRecipientType('email');
                        setRequestRecipient('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                        requestRecipientType === 'email'
                          ? 'bg-[#C1121F]/10 border border-[#C1121F]/30 text-[#C1121F]'
                          : 'border border-transparent text-[#b7b5b4] hover:text-[#F5F5F5]'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      disabled={friends.length === 0}
                      onClick={() => {
                        setRequestRecipientType('friend');
                        setRequestRecipient(friends[0]?.email || '');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 ${
                        requestRecipientType === 'friend'
                          ? 'bg-[#C1121F]/10 border border-[#C1121F]/30 text-[#C1121F]'
                          : 'border border-transparent text-[#b7b5b4] hover:text-[#F5F5F5]'
                      }`}
                      title={friends.length === 0 ? 'No friends saved yet' : ''}
                    >
                      Friend List {friends.length > 0 && `(${friends.length})`}
                    </button>
                  </div>
                </div>

                {/* Recipient Input */}
                {requestRecipientType === 'email' ? (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="req-email" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">
                      Payer Email
                    </label>
                    <input 
                      id="req-email"
                      type="email" 
                      required
                      placeholder="friend@email.com"
                      value={requestRecipient}
                      onChange={(e) => setRequestRecipient(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 font-sans text-xs text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="req-friend" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">
                      Select Friend
                    </label>
                    <select
                      id="req-friend"
                      required
                      value={requestRecipient}
                      onChange={(e) => setRequestRecipient(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 font-sans text-xs text-[#F5F5F5] outline-none focus:border-[#C1121F] transition-colors"
                    >
                      {friends.map((friend) => (
                        <option key={friend.id} value={friend.email}>
                          {friend.name} ({friend.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Generate Button */}
                <button 
                  type="submit"
                  className="w-full bg-[#C1121F] text-white font-sans text-xs font-semibold py-3.5 rounded-xl hover:bg-[#a00f1a] transition-all active:scale-[0.98] cursor-pointer mt-2 shadow-lg shadow-[#C1121F]/10 flex items-center justify-center gap-1.5"
                >
                  Create Request
                </button>
              </form>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                {/* Request Details Title */}
                <div className="space-y-1">
                  <p className="font-sans text-[#F5F5F5] text-xs font-semibold">Request for ${parseFloat(requestAmount).toFixed(2)} USDC</p>
                  <p className="font-mono text-[9px] text-[#b7b5b4]/60 uppercase">Created for {requestRecipient}</p>
                </div>

                {/* QR Code representing the Request Deep-link */}
                <div className="w-40 h-40 bg-white border border-[#2A2A2A] rounded-2xl p-3.5 flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] duration-300 relative">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedRequestLink)}&margin=5`}
                    alt="Request QR Code" 
                    className="w-full h-full select-none"
                    draggable="false"
                  />
                  {/* Miniature Logo in center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white p-0.5 rounded-lg flex items-center justify-center shadow-md">
                    <div className="w-6 h-6 bg-[#C1121F] rounded-md flex items-center justify-center overflow-hidden">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-4 h-4 text-white stroke-current fill-none"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M 10,50 L 30,50 L 38,40 L 44,60 L 50,50 L 56,15 L 64,85 L 70,50 L 76,55 L 82,50 L 90,50" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Copy Link Input Widget */}
                <div className="w-full space-y-2 text-left">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/40 block">Request Payment Link</span>
                  <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5">
                    <span className="font-mono text-[10px] text-[#b7b5b4] truncate mr-4">
                      {generatedRequestLink}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedRequestLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 1500);
                      }}
                      className="text-[#b7b5b4]/40 hover:text-[#C1121F] transition-colors cursor-pointer flex-shrink-0"
                      title="Copy link"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Back / Reset Button */}
                <button 
                  onClick={() => setGeneratedRequestLink('')}
                  className="w-full bg-[#1A1A1A] hover:bg-[#201f1f] text-[#b7b5b4] hover:text-[#F5F5F5] border border-[#2A2A2A] font-sans text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
