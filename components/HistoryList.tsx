'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '../lib/types';
import { useUser } from './AuthGate';
import { Send, Wallet, ArrowUpDown, RefreshCw, Check } from 'lucide-react';

export default function HistoryList() {
  const { email, universalAddress } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/transactions?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [universalAddress, email]);

  if (loading) {
    return (
      <div className="text-center py-8 font-mono text-xs text-[#b7b5b4]">
        Loading history...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border border-[#2A2A2A] rounded-2xl bg-[#1A1A1A]/20 font-mono text-xs text-[#b7b5b4]/50">
        No transactions yet. Send your first payment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Activity Logs</h2>
        <button 
          onClick={fetchTransactions}
          className="text-[9px] font-mono uppercase tracking-wider text-[#C1121F] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden divide-y divide-[#2A2A2A] shadow-xl">
        {transactions.map((tx) => {
          const isSend = tx.type === 'send';
          const isReceive = tx.type === 'receive';
          const partnerName = tx.partnerEmail.includes('@') ? tx.partnerEmail.split('@')[0] : tx.partnerEmail;
          
          return (
            <div 
              key={tx.id}
              className="p-4 flex items-center justify-between hover:bg-[#201f1f]/20 transition-colors"
            >
              {/* Left Side: Type Icon + Email + Time */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                  isSend 
                    ? 'bg-[#C1121F]/10 border-[#C1121F]/20 text-[#C1121F]' 
                    : isReceive 
                    ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' 
                    : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5]'
                }`}>
                  {isSend ? (
                    <Send className="w-3.5 h-3.5" />
                  ) : isReceive ? (
                    <Wallet className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono text-[#F5F5F5] truncate max-w-[160px] sm:max-w-none">
                    {tx.partnerEmail}
                  </p>
                  <p className="text-[9px] text-[#b7b5b4]/40 font-mono">
                    {tx.timestamp}
                  </p>
                </div>
              </div>

              {/* Right Side: Status Badge / Amount */}
              <div className="text-right flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={`font-mono text-xs font-semibold ${
                    isSend 
                      ? 'text-[#F5F5F5]' 
                      : isReceive 
                      ? 'text-[#10B981]' 
                      : 'text-[#F5F5F5]'
                  }`}>
                    {isSend ? '- ' : isReceive ? '+ ' : ''}
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[8px] font-mono text-[#b7b5b4]/40 uppercase">USDC</span>
                </div>
                
                <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#10B981]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
