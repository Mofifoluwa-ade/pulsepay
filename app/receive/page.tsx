'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useUser } from '../../components/AuthGate';
import { QrCode, Copy, Check, Info } from 'lucide-react';

export default function ReceivePage() {
  const { email, universalAddress } = useUser();
  const [copied, setCopied] = useState(false);

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

          {/* Network Notice */}
          <div className="flex items-start gap-2 text-left bg-[#0A0A0A]/50 border border-[#2A2A2A]/40 rounded-xl p-3.5 w-full relative z-10">
            <Info className="w-4 h-4 text-[#C1121F] flex-shrink-0 mt-0.5" />
            <div className="font-mono text-[9px] text-[#b7b5b4]/60 uppercase tracking-wide leading-relaxed">
              Accepts USDC deposits directly on the Arbitrum Sepolia Testnet. Gas sponsoring is enabled on inbound settlements.
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
