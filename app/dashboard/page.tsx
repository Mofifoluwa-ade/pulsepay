'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import BalanceCard from '../../components/BalanceCard';
import { Transaction } from '../../lib/types';
import { useUser } from '../../components/AuthGate';
import { Send, Wallet, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { email, universalAddress } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [universalAddress]);

  // Extract friendly capitalized name from email
  const getGreetingName = () => {
    if (!email) return 'Mofi';
    const prefix = email.split('@')[0];
    const cleanName = prefix.split('.')[0].split('_')[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 py-4">
        
        {/* User Greeting */}
        <div className="space-y-1">
          <h2 className="text-[#b7b5b4] text-xs font-mono uppercase tracking-widest">Welcome Back</h2>
          <h1 className="font-sans text-2xl font-bold text-[#F5F5F5]">
            Good morning, {getGreetingName()}
          </h1>
        </div>

        {/* Balance & Send Card */}
        <BalanceCard />

        {/* Recent Activity List */}
        <section className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Recent</h3>
            <Link 
              href="/history" 
              className="font-mono text-[9px] uppercase tracking-wider text-[#C1121F] hover:underline"
            >
              All Activity
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-6 text-xs text-[#b7b5b4] font-mono">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 border border-[#2A2A2A] bg-[#1A1A1A]/20 rounded-2xl font-mono text-[11px] text-[#b7b5b4]/50">
              No transactions yet. Send your first payment.
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden divide-y divide-[#2A2A2A]">
              {transactions.slice(0, 4).map((tx) => {
                const isSend = tx.type === 'send';
                const isReceive = tx.type === 'receive';
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#201f1f]/20 transition-colors">
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

                    <div className="text-right flex items-center gap-1.5">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
