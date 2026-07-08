'use client';

import React, { useState } from 'react';
import { useUser } from './AuthGate';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowUpRight, QrCode } from 'lucide-react';
import EkgWave from './EkgWave';

export default function BalanceCard() {
  const { balance, universalAddress, refreshBalance } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 relative overflow-hidden group shadow-xl">
      {/* Subtle radial sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col space-y-6">
        
        {/* Top bar with label and refresh */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">Available Balance</span>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-[#b7b5b4] hover:text-[#C1121F] disabled:opacity-50 transition-colors p-1.5 rounded-lg hover:bg-[#0A0A0A]/50 cursor-pointer"
            title="Sync Balance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Large Balance Display */}
        <div className="flex items-baseline space-x-2">
          <span className="font-sans text-5xl font-bold tracking-tight text-[#F5F5F5]">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="font-mono text-xs text-[#b7b5b4]/50">USDC</span>
        </div>

        {/* Horizontal EKG wave line */}
        <div className="h-12 w-full overflow-hidden relative opacity-60">
          <EkgWave height={48} speed={3.0} color="#C1121F" strokeWidth={1.5} glow={false} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => router.push('/send')}
            className="w-full bg-[#C1121F] text-white font-sans text-sm font-semibold py-3.5 rounded-xl hover:bg-[#a00f1a] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#C1121F]/10"
          >
            <span>Send</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => router.push('/receive')}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] font-sans text-sm font-semibold py-3.5 rounded-xl hover:bg-[#201f1f] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Receive</span>
            <QrCode className="w-3.5 h-3.5 text-[#C1121F]" />
          </button>
        </div>

        {/* Subtle, hidden technical account detail for power users */}
        {universalAddress && (
          <div className="pt-2 text-center">
            <span className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/20 hover:text-[#b7b5b4]/40 transition-colors">
              Smart Account: {universalAddress.substring(0, 6)}...{universalAddress.substring(38)}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
