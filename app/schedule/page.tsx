'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ScheduledPayment } from '../../lib/types';
import { useUser } from '../../components/AuthGate';
import { Calendar, Mail, DollarSign, Clock, Trash2, Plus, Sparkles } from 'lucide-react';

export default function SchedulePage() {
  const { email, balance } = useUser();
  const [scheduled, setScheduled] = useState<ScheduledPayment[]>([]);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'once'>('weekly');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchScheduled = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/schedule?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setScheduled(data);
      }
    } catch (e) {
      console.error('Failed to load schedules:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, [email]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: recipient, amount: parseFloat(amount), frequency, email }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Payment scheduled successfully.` });
        setRecipient('');
        setAmount('');
        fetchScheduled();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule payment.');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/schedule?id=${id}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setScheduled((prev) => prev.filter((sp) => sp.id !== id));
      }
    } catch (e) {
      console.error('Failed to cancel schedule:', e);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-[#b7b5b4] text-xs font-mono uppercase tracking-widest">Automation Engine</h2>
          <h1 className="font-sans text-2xl font-bold text-[#F5F5F5] flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#C1121F]" />
            <span>Scheduled Payments</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left: Schedule Setup Form */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Setup Auto-Pay</h3>
            
            <form 
              onSubmit={handleScheduleSubmit}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden shadow-xl"
            >
              {message && (
                <div className={`p-3.5 rounded-xl font-mono text-xs border ${
                  message.type === 'success' 
                    ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' 
                    : 'bg-[#FF4757]/10 border-[#FF4757]/20 text-[#FF4757]'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Recipient */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sched-recipient" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">Recipient Email</label>
                <div className="relative">
                  <input 
                    id="sched-recipient"
                    type="email" 
                    required
                    placeholder="name@email.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 font-sans text-xs text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b5b4]/30" />
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sched-amount" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b5b4]/30" />
                  <input 
                    id="sched-amount"
                    type="number" 
                    required
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl pl-9 pr-12 py-3 font-sans text-xs text-[#F5F5F5] placeholder-[#b7b5b4]/20 outline-none focus:border-[#C1121F] transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[#b7b5b4]/40">USDC</span>
                </div>
              </div>

              {/* Frequency */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sched-freq" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">Interval</label>
                <select 
                  id="sched-freq"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 font-sans text-xs text-[#F5F5F5] outline-none focus:border-[#C1121F] transition-colors cursor-pointer"
                >
                  <option value="daily">Daily Heartbeat</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="once">One-Time Delayed</option>
                </select>
              </div>

              {/* Schedule CTA */}
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C1121F] text-white font-sans text-xs font-semibold py-3.5 rounded-xl hover:bg-[#a00f1a] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer mt-1 shadow-lg shadow-[#C1121F]/10 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Scheduling...' : 'Schedule Payment'}</span>
              </button>
            </form>
          </div>

          {/* Right: Active Schedules List */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]">Active Automations</h3>

            {loading ? (
              <div className="text-center py-8 text-xs text-[#b7b5b4] font-mono">
                Loading schedules...
              </div>
            ) : scheduled.length === 0 ? (
              <div className="text-center py-12 border border-[#2A2A2A] bg-[#1A1A1A]/20 rounded-2xl font-mono text-xs text-[#b7b5b4]/50">
                No scheduled payments yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {scheduled.map((sp) => (
                  <div 
                    key={sp.id}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center justify-between hover:bg-[#201f1f]/20 transition-all shadow-md group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Active green pulsing dot */}
                      <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                        <Clock className="w-4 h-4" />
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-xs font-mono text-[#F5F5F5] font-semibold">{sp.recipientEmail}</p>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-[#b7b5b4]/50">
                          <span className="capitalize">{sp.frequency}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1">
                            <span>Next:</span>
                            <span className="text-[#b7b5b4]/70">{sp.nextExecution}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-[#F5F5F5]">
                          ${sp.amount.toFixed(2)}
                        </span>
                        <span className="text-[8px] font-mono text-[#b7b5b4]/30 block uppercase">USDC</span>
                      </div>

                      <button
                        onClick={() => handleCancelSchedule(sp.id)}
                        className="text-[#b7b5b4]/40 hover:text-[#FF4757] p-2 rounded-lg hover:bg-[#FF4757]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Cancel Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
