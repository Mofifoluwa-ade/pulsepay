'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useUser } from '../../components/AuthGate';
import { User, Copy, Check, ShieldCheck, Flame, Cpu, LogOut, Wallet } from 'lucide-react';

export default function ProfilePage() {
  const { email, address, universalAddress, balance, logout } = useUser();
  const [copiedSigner, setCopiedSigner] = useState(false);
  const [copiedSmart, setCopiedSmart] = useState(false);

  const handleCopySigner = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedSigner(true);
      setTimeout(() => setCopiedSigner(false), 1500);
    }
  };

  const handleCopySmart = () => {
    if (universalAddress) {
      navigator.clipboard.writeText(universalAddress);
      setCopiedSmart(true);
      setTimeout(() => setCopiedSmart(false), 1500);
    }
  };

  const getInitials = () => {
    if (!email) return 'PP';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        
        {/* Page Header */}
        <div className="space-y-0.5">
          <h2 className="text-[#b7b5b4] text-xs font-mono uppercase tracking-widest font-semibold">Account Manager</h2>
          <h1 className="font-sans text-2xl font-bold text-[#F5F5F5] flex items-center gap-2.5">
            <User className="w-6 h-6 text-[#C1121F]" />
            <span>Cryptographic Profile</span>
          </h1>
        </div>

        {/* Profile Card Summary */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,18,31,0.03)_0%,transparent_65%)] pointer-events-none" />
          
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-2xl font-bold font-mono text-[#C1121F] shadow-inner select-none flex-shrink-0">
            {getInitials()}
          </div>

          {/* User Details */}
          <div className="space-y-2 text-center sm:text-left min-w-0">
            <h2 className="text-xl font-bold text-[#F5F5F5] truncate">{email}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono text-[9px] uppercase bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] px-2 py-0.5 rounded-lg">
                EIP-7702 Upgraded
              </span>
              <span className="font-mono text-[9px] uppercase bg-[#C1121F]/10 border border-[#C1121F]/25 text-[#C1121F] px-2 py-0.5 rounded-lg">
                Arbitrum Sepolia Testnet
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Cryptographic Addresses */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4] border-b border-[#2A2A2A]/40 pb-2.5">
              Wallet Credentials
            </h3>

            <div className="space-y-4">
              {/* EOA Signer */}
              <div className="space-y-1">
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/50">Magic Signer (EOA Address)</span>
                <div className="flex justify-between items-center bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3 py-2.5">
                  <span className="font-mono text-xs text-[#F5F5F5] truncate mr-4">
                    {address || 'Resolving...'}
                  </span>
                  <button 
                    onClick={handleCopySigner}
                    className="text-[#b7b5b4]/40 hover:text-[#C1121F] transition-colors cursor-pointer flex-shrink-0"
                    title="Copy Signer Address"
                  >
                    {copiedSigner ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Universal Account */}
              <div className="space-y-1">
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/50">Smart Account (EIP-7702 Contract)</span>
                <div className="flex justify-between items-center bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3 py-2.5">
                  <span className="font-mono text-xs text-[#F5F5F5] truncate mr-4">
                    {universalAddress || 'Resolving...'}
                  </span>
                  <button 
                    onClick={handleCopySmart}
                    className="text-[#b7b5b4]/40 hover:text-[#C1121F] transition-colors cursor-pointer flex-shrink-0"
                    title="Copy Smart Account Address"
                  >
                    {copiedSmart ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Infrastructure Stack */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4] border-b border-[#2A2A2A]/40 pb-2.5">
              Protocol Stack
            </h3>

            <div className="space-y-3 font-mono text-[10px]">
              
              <div className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]/20">
                <div className="flex items-center gap-2 text-[#b7b5b4]/60">
                  <Wallet className="w-3.5 h-3.5 text-[#C1121F]" />
                  <span>Key Custody</span>
                </div>
                <span className="text-[#F5F5F5] font-semibold">Magic Labs SDK (Social Login)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]/20">
                <div className="flex items-center gap-2 text-[#b7b5b4]/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Smart Account</span>
                </div>
                <span className="text-[#F5F5F5] font-semibold">Particle Network (EIP-7702)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]/20">
                <div className="flex items-center gap-2 text-[#b7b5b4]/60">
                  <Flame className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Gas Sponsoring</span>
                </div>
                <span className="text-[#F5F5F5] font-semibold">ZeroDev paymaster (Sponsored)</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <div className="flex items-center gap-2 text-[#b7b5b4]/60">
                  <Cpu className="w-3.5 h-3.5 text-[#C1121F]" />
                  <span>Settlement Engine</span>
                </div>
                <span className="text-[#F5F5F5] font-semibold">Arbitrum Sepolia Testnet</span>
              </div>

            </div>
          </div>

        </div>

        {/* Danger Zone Actions */}
        <div className="bg-[#1A1A1A] border border-[#FF4757]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-sans text-sm font-bold text-[#F5F5F5]">Disconnect Wallet</h4>
            <p className="font-sans text-xs text-[#b7b5b4]/65">Remove all cryptographic sessions from this browser.</p>
          </div>
          <button 
            onClick={logout}
            className="bg-[#FF4757]/10 hover:bg-[#FF4757]/20 text-[#FF4757] border border-[#FF4757]/30 text-xs font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
