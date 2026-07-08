'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Transaction, ScheduledPayment } from '../../lib/types';
import { useUser } from '../../components/AuthGate';
import { Send, Wallet, Clock, Flame, RefreshCw, Copy, Check, Plus, Calendar, Activity, QrCode, X } from 'lucide-react';
import TxStatus from '../../components/TxStatus';
import EkgWave from '../../components/EkgWave';
import BalanceCard from '../../components/BalanceCard';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { email, universalAddress, balance, refreshBalance } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schedules, setSchedules] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Clipboard copy state
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Send State (Desktop only)
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendTxData, setSendTxData] = useState<{ toEmail: string; amount: number; from: string } | null>(null);

  // QR Modal State
  const [isQrOpen, setIsQrOpen] = useState(false);
  // Toggle between Email and Smart Address display inside QR Modal
  const [showAddressInModal, setShowAddressInModal] = useState(true);

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

  // Generate QR Code URL for the modal
  const qrCodeUrl = universalAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(universalAddress)}&margin=10`
    : '';

  return (
    <DashboardLayout>
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. Mobile Orientation Layout (Simple & Clean Mockup Style) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-6 max-w-md mx-auto py-2">
        {/* User Greeting & Sub-heading */}
        <div className="space-y-0.5">
          <h2 className="text-[#b7b5b4] text-[9px] font-mono uppercase tracking-widest">PulsePay Portal</h2>
          <h1 className="font-sans text-2xl font-bold text-[#F5F5F5]">
            Good morning, {getGreetingName()}
          </h1>
        </div>

        {/* Unified Balance & Send Card */}
        <BalanceCard />

        {/* Mobile Simple Recent Activities */}
        <section className="space-y-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">Recent</h3>
            <Link 
              href="/history" 
              className="font-mono text-[9px] uppercase tracking-wider text-[#C1121F] hover:underline"
            >
              All Activity
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6 text-xs text-[#b7b5b4] font-mono">
              Loading...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 border border-[#2A2A2A] bg-[#1A1A1A]/20 rounded-2xl font-mono text-[10px] text-[#b7b5b4]/50">
              No transactions yet.
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden divide-y divide-[#2A2A2A] shadow-md">
              {transactions.slice(0, 3).map((tx) => {
                const isSend = tx.type === 'send';
                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-[#201f1f]/20 transition-colors">
                    <div className="min-w-0 leading-tight">
                      <p className="text-xs font-mono text-[#F5F5F5] truncate max-w-[180px]">{tx.partnerEmail}</p>
                      <span className="text-[8px] text-[#b7b5b4]/35 font-mono">{tx.timestamp}</span>
                    </div>
                    <span className={`font-mono text-xs font-semibold ${isSend ? 'text-[#F5F5F5]' : 'text-[#10B981]'}`}>
                      {isSend ? '- ' : '+ '}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. Desktop Orientation Layout (Structured Grid Panel) */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6 max-w-7xl mx-auto py-2">
        
        {/* Header Title & Sync Assets */}
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h2 className="text-[#b7b5b4] text-[10px] font-mono uppercase tracking-widest">Dashboard Overview</h2>
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
        <div className="grid grid-cols-4 gap-4">
          
          {/* Card 1: Balance */}
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

          {/* Card 2: Account Email & QR Expand */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-2 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">Receive Payments</span>
              <button 
                onClick={() => setIsQrOpen(true)}
                className="text-[#b7b5b4]/40 hover:text-[#C1121F] transition-colors cursor-pointer"
                title="Expand QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
            <span className="font-mono text-xs text-[#F5F5F5] truncate block select-all">
              {email || 'loading...'}
            </span>
          </div>

          {/* Card 3: Schedules */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60 block">Active Automations</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C1121F]" />
              <span className="font-sans text-base font-bold text-[#F5F5F5]">
                {schedules.length} {schedules.length === 1 ? 'Schedule' : 'Schedules'}
              </span>
            </div>
          </div>

          {/* Card 4: Paymaster Status */}
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
        <div className="grid grid-cols-5 gap-6">
          
          {/* Left Side: Operations (Quick Send + Recurring Schedules) */}
          <div className="col-span-3 space-y-6">
            
            {/* Quick Send Widget */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2A2A2A]/40 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Quick Send</h3>
                <span className="font-mono text-[9px] text-[#b7b5b4]/30">No fees &middot; Instant</span>
              </div>

              <form onSubmit={handleQuickSendSubmit} className="grid grid-cols-3 gap-4 items-end">
                {/* Recipient Email */}
                <div className="col-span-2 space-y-1.5">
                  <label htmlFor="qs-email-ds" className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/60">Recipient Email</label>
                  <input 
                    id="qs-email-ds"
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
                  <label htmlFor="qs-amount-ds" className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/60">Amount</label>
                  <div className="relative">
                    <input 
                      id="qs-amount-ds"
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
                <div className="col-span-3 pt-2">
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
                          <p className="text-[11px] font-mono text-[#F5F5F5] truncate max-w-[200px]">{sp.recipientEmail}</p>
                          <span className="text-[8px] font-mono text-[#b7b5b4]/40 capitalize">{sp.frequency} &middot; Next: {sp.nextExecution}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold text-[#F5F5F5]">${sp.amount.toFixed(2)}</span>
                        <button 
                          onClick={() => handleCancelSchedule(sp.id)}
                          className="text-[#b7b5b4]/40 hover:text-[#FF4757] p-1.5 hover:bg-[#FF4757]/10 border border-transparent hover:border-[#FF4757]/20 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                          title="Cancel Schedule"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Analytics & Health (Recent Activity + Live EKG monitor) */}
          <div className="col-span-2 space-y-6">
            
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
                            <p className="text-[11px] font-mono text-[#F5F5F5] truncate max-w-[120px]">{tx.partnerEmail}</p>
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

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. Expandable QR Code Overlay Modal */}
      {/* ──────────────────────────────────────────────────────── */}
      {isQrOpen && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsQrOpen(false)}
        >
          <div 
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">PulsePay Account</span>
              <h2 className="text-sm font-mono text-[#F5F5F5] font-semibold truncate max-w-[280px]">{email}</h2>
            </div>
            
            {/* Scannable QR Code */}
            <div className="w-48 h-48 bg-white border border-[#2A2A2A] rounded-2xl p-4 flex items-center justify-center mx-auto relative shadow-lg">
              {qrCodeUrl ? (
                <>
                  <img 
                    src={qrCodeUrl} 
                    alt="Smart Account QR Code" 
                    className="w-full h-full select-none animate-fade-in"
                    draggable="false"
                  />
                  {/* Logo overlay in exact center */}
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
                <div className="text-xs font-mono text-gray-400">Loading...</div>
              )}
            </div>

            {/* Smart Account details & copy */}
            <div className="space-y-3.5 text-left">
              {/* Physical Segment Toggle Switch */}
              <div className="flex bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-0.5 w-full select-none relative overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setShowAddressInModal(true)}
                  className="flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider cursor-pointer relative z-10 transition-colors duration-200 text-center"
                >
                  <span className={showAddressInModal ? 'text-[#C1121F] font-semibold' : 'text-[#b7b5b4]/50'}>
                    Address
                  </span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddressInModal(false)}
                  className="flex-1 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider cursor-pointer relative z-10 transition-colors duration-200 text-center"
                >
                  <span className={!showAddressInModal ? 'text-[#C1121F] font-semibold' : 'text-[#b7b5b4]/50'}>
                    Email
                  </span>
                </button>
                
                {/* Smooth sliding pill highlight */}
                <motion.div 
                  className="absolute top-0.5 bottom-0.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]/40 z-0"
                  layout
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    left: showAddressInModal ? '2px' : 'calc(50% + 1px)',
                    right: showAddressInModal ? 'calc(50% + 1px)' : '2px',
                  }}
                />
              </div>

              {/* Display Value & Copy Block */}
              <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3">
                <span className="font-mono text-xs text-[#F5F5F5] truncate mr-4">
                  {showAddressInModal 
                    ? (universalAddress ? `${universalAddress.substring(0, 10)}...${universalAddress.substring(32)}` : 'Resolving...') 
                    : (email || '')
                  }
                </span>
                <button 
                  onClick={() => {
                    const toCopy = showAddressInModal ? (universalAddress || '') : (email || '');
                    navigator.clipboard.writeText(toCopy);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  disabled={showAddressInModal ? !universalAddress : !email}
                  className="text-[#b7b5b4]/40 hover:text-[#C1121F] disabled:opacity-40 transition-colors cursor-pointer flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Close modal */}
            <button 
              onClick={() => setIsQrOpen(false)}
              className="w-full bg-[#C1121F] hover:bg-[#a00f1a] text-white font-sans text-xs font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

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
