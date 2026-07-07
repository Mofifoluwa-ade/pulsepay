'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Transaction, ScheduledPayment } from '../../lib/types';
import { useUser } from '../../components/AuthGate';
import { Send, Wallet, Clock, ShieldCheck, Flame, RefreshCw, Copy, Check, Plus, Calendar, Activity } from 'lucide-react';
import TxStatus from '../../components/TxStatus';
import EkgWave from '../../components/EkgWave';
import Link from 'next/link';

export default function Dashboard() {
  const { email, universalAddress, balance, refreshBalance } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedules, setSchedules] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clipboard copy state
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Send State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendTxData, setSendTxData] = useState<{ toEmail: string; amount: number; from: string } | null>(null);

  const loadData = async () => {
    try {
      // Load transactions
      const txRes = await fetch('/api/transactions');
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }

      // Load schedules
      const schedRes = await fetch('/api/schedule');
      if (schedRes.ok) {
        const schedData = await schedRes.json();
        setSchedules(schedData);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [universalAddress]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    await loadData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCopyAddress = () => {
    if (universalAddress) {
      navigator.clipboard.writeText(universalAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleQuickSendSubmit = (e: React.FormEvent) => {
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
    setSendTxData({
      toEmail: recipient,
      amount: parseFloat(amount),
      from: universalAddress,
    });
    setIsSending(true);
  };

  const handleCancelSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedule?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSchedules((prev) => prev.filter((sp) => sp.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getGreetingName = () => {
    if (!email) return 'Mofi';
    const prefix = email.split('@')[0];
    const cleanName = prefix.split('.')[0].split('_')[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        
        {/* Dynamic Greeting & Sync Control */}
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h2 className="text-[#b7b5b4] text-[10px] font-mono uppercase tracking-widest">Dashboard</h2>
            <h1 className="font-sans text-2xl font-bold text-[#F5F5F5]">
              Good morning, {getGreetingName()}
            </h1>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#b7b5b4] border border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#C1121F] px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Assets</span>
          </button>
        </div>

        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Unified USDC Balance */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-2 relative overflow-hidden group">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60 block">Unified Liquidity</span>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-xl font-bold text-[#F5F5F5]">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[9px] text-[#b7b5b4]/40">USDC</span>
            </div>
            <div className="absolute top-0 right-0 h-full w-24 opacity-5 pointer-events-none overflow-hidden">
              <EkgWave height={64} speed={4.0} color="#C1121F" strokeWidth={1} glow={false} />
            </div>
          </div>

          {/* Card 2: EIP-7702 Smart Account */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">Smart Account</span>
              <button 
                onClick={handleCopyAddress}
                className="text-[#b7b5b4]/40 hover:text-[#C1121F] transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="font-mono text-xs text-[#F5F5F5] truncate block">
              {universalAddress ? `${universalAddress.substring(0, 8)}...${universalAddress.substring(34)}` : 'Resolving...'}
            </span>
          </div>

          {/* Card 3: Active Automations */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60 block">Active Automations</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C1121F]" />
              <span className="font-sans text-base font-bold text-[#F5F5F5]">
                {schedules.length} {schedules.length === 1 ? 'Schedule' : 'Schedules'}
              </span>
            </div>
          </div>

          {/* Card 4: Fee Sponsoring Status */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60 block">Gas Subsidy</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#10B981] fill-[#10B981]/10" />
              <span className="font-sans text-xs font-semibold text-[#10B981] uppercase tracking-wider">
                100% Sponsored
              </span>
            </div>
          </div>

        </div>

        {/* Row 2: Split Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Side: Operations (Quick Send + Recurring Schedules) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Quick Send Widget */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2A2A2A]/40 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Quick Send</h3>
                <span className="font-mono text-[9px] text-[#b7b5b4]/30">No fees &middot; Instant</span>
              </div>

              <form onSubmit={handleQuickSendSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Recipient Email */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="qs-email" className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/60">Recipient Email</label>
                  <input 
                    id="qs-email"
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 font-sans text-xs text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="qs-amount" className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/60">Amount</label>
                  <div className="relative">
                    <input 
                      id="qs-amount"
                      type="number"
                      required
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-3 pr-10 py-2.5 font-sans text-xs text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[8px] text-[#b7b5b4]/40">USDC</span>
                  </div>
                </div>

                {/* Full-width CTA Submit */}
                <div className="sm:col-span-3 pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-[#C1121F] text-white font-sans text-xs font-semibold py-3 rounded-xl hover:bg-[#a00f1a] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#C1121F]/10"
                  >
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Recurring Schedules Widget */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2A2A2A]/40 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Recurring Payments</h3>
                <Link href="/schedule" className="font-mono text-[9px] uppercase tracking-wider text-[#C1121F] hover:underline flex items-center gap-0.5">
                  <Plus className="w-3 h-3" />
                  <span>Configure</span>
                </Link>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-6 font-mono text-[10px] text-[#b7b5b4]/30">
                  No automated schedules configured.
                </div>
              ) : (
                <div className="space-y-2">
                  {schedules.slice(0, 3).map((sp) => (
                    <div key={sp.id} className="bg-[#0A0A0A] border border-[#2A2A2A]/60 rounded-xl p-3 flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#C1121F]" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono text-[#F5F5F5] truncate max-w-[150px] sm:max-w-none">{sp.recipientEmail}</p>
                          <span className="text-[8px] font-mono text-[#b7b5b4]/40 capitalize">{sp.frequency} &middot; Next: {sp.nextExecution}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold text-[#F5F5F5]">${sp.amount.toFixed(2)}</span>
                        <button 
                          onClick={() => handleCancelSchedule(sp.id)}
                          className="text-[#b7b5b4]/30 hover:text-[#FF4757] transition-colors cursor-pointer"
                          title="Cancel Schedule"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Analytics & Health (Recent Activity + Live EKG monitor) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Activity List */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-[#2A2A2A]/40 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Recent Activity</h3>
                <Link href="/history" className="font-mono text-[9px] uppercase tracking-wider text-[#C1121F] hover:underline">
                  View Logs
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 font-mono text-[10px] text-[#b7b5b4]/30">
                  No transaction records.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 4).map((tx) => {
                    const isSend = tx.type === 'send';
                    return (
                      <div key={tx.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                            isSend ? 'bg-[#C1121F]/10 border-[#C1121F]/20 text-[#C1121F]' : 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
                          }`}>
                            {isSend ? <Send className="w-2.5 h-2.5" /> : <Wallet className="w-2.5 h-2.5" />}
                          </div>
                          <div className="min-w-0 leading-tight">
                            <p className="text-[11px] font-mono text-[#F5F5F5] truncate max-w-[120px] sm:max-w-none">{tx.partnerEmail}</p>
                            <span className="text-[8px] font-mono text-[#b7b5b4]/40">{tx.timestamp}</span>
                          </div>
                        </div>
                        <span className={`font-mono text-[11px] font-semibold ${isSend ? 'text-[#F5F5F5]' : 'text-[#10B981]'}`}>
                          {isSend ? '- ' : '+ '}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pulse Monitor & Health */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#2A2A2A]/40 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#C1121F] animate-pulse" />
                  <span>Network Pulse</span>
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" title="System Operational" />
              </div>

              {/* Mini live EKG wave */}
              <div className="h-16 w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden relative flex items-center justify-center opacity-85 shadow-inner">
                <EkgWave height={64} speed={2} color="#C1121F" strokeWidth={1.5} glow={true} />
              </div>

              {/* Status details */}
              <div className="space-y-1.5 font-mono text-[9px] text-[#b7b5b4]/60">
                <div className="flex justify-between">
                  <span>Network ID:</span>
                  <span className="text-[#F5F5F5]">421614 (Sepolia)</span>
                </div>
                <div className="flex justify-between">
                  <span>Smart Account type:</span>
                  <span className="text-[#F5F5F5]">EIP-7702</span>
                </div>
                <div className="flex justify-between">
                  <span>Paymaster logic:</span>
                  <span className="text-[#10B981] font-semibold">ZeroDev Sponsoring</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Transaction Status Overlay / Modal */}
      {isSending && sendTxData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-2 w-full max-w-md shadow-2xl relative overflow-hidden">
            <TxStatus 
              toEmail={sendTxData.toEmail}
              amount={sendTxData.amount}
              from={sendTxData.from}
              onClose={() => {
                setIsSending(false);
                setSendTxData(null);
                setRecipient('');
                setAmount('');
                loadData(); // Reload balance and transactional details
              }}
            />
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
