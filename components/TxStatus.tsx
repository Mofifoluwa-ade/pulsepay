'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from './AuthGate';
import { motion } from 'motion/react';
import { Check, X, Loader2, ArrowUpRight, ArrowRight } from 'lucide-react';
import EkgWave from './EkgWave';

interface TxStatusProps {
  toEmail: string;
  amount: number;
  from: string;
  onClose: () => void;
}

type Stage = 'Routing' | 'Processing' | 'Completed' | 'Failed';

export default function TxStatus({ toEmail, amount, from, onClose }: TxStatusProps) {
  const { refreshBalance } = useUser();
  const [stage, setStage] = useState<Stage>('Routing');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Execute the transaction request
  useEffect(() => {
    let active = true;
    let pollInterval: NodeJS.Timeout;

    const startTransaction = async () => {
      try {
        setStage('Routing');
        
        // 1. Post to send API
        const res = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, toEmail, amount }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Could not route transaction.');
        }

        const data = await res.json();
        if (!active) return;
        
        setTxHash(data.txHash);
        setStage('Processing');

        // 2. Poll registry balance to complete transaction simulation on Arb Sepolia
        let checks = 0;
        pollInterval = setInterval(async () => {
          checks++;
          refreshBalance();

          if (checks >= 2) { // 4 seconds of processing for gas sponsorship & block inclusion
            clearInterval(pollInterval);
            if (active) {
              setStage('Completed');
              refreshBalance();
            }
          }
        }, 2000);

      } catch (err: any) {
        console.error('Transaction execution failed:', err);
        if (active) {
          setStage('Failed');
          setErrorMessage(err.message || 'Routing error occurred. Check recipient and retry.');
        }
      }
    };

    startTransaction();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [from, toEmail, amount]);

  if (stage === 'Completed') {
    const cleanName = toEmail.split('@')[0];
    
    return (
      <div className="relative flex flex-col items-center justify-between min-h-[380px] p-6 text-center select-none bg-[#1A1A1A] z-10">
        
        {/* Expanding Pulse Ring Animation (Concentric Rings) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <motion.div
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2.0, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-36 h-36 rounded-full border border-[#C1121F]/40"
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2.0, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-36 h-36 rounded-full border border-[#C1121F]/20"
          />
        </div>

        {/* Solid Red Checkmark Icon */}
        <div className="relative z-10 mt-4 flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-[#C1121F] flex items-center justify-center shadow-lg shadow-[#C1121F]/20"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3.5} />
          </motion.div>
        </div>

        {/* Copy confirmation text */}
        <div className="relative z-10 space-y-2 mt-6">
          <h1 className="font-sans text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Sent.
          </h1>
          <p className="font-sans text-xl font-medium text-[#F5F5F5]">
            ${amount.toFixed(2)}
          </p>
          <p className="font-mono text-xs text-[#b7b5b4]">
            to {toEmail}
          </p>
        </div>

        {/* Drawing EKG Waveform Across Bottom */}
        <div className="w-full max-w-xs h-12 relative overflow-hidden mt-6 opacity-80 z-10">
          <svg viewBox="0 0 200 40" className="w-full h-full text-[#C1121F] stroke-current fill-none">
            <motion.path
              d="M 0,20 L 70,20 L 78,12 L 84,28 L 90,20 L 96,2 L 104,38 L 110,20 L 116,24 L 122,20 L 200,20"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Micro-details and Actions */}
        <div className="w-full relative z-10 space-y-4 mt-6">
          <div className="font-mono text-[9px] uppercase tracking-wider text-[#b7b5b4]/40">
            No fees · Instant · Cross-chain
          </div>

          <div className="flex flex-col gap-3">
            {txHash && (
              <a
                href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/40 hover:text-[#F5F5F5] transition-colors"
              >
                <span>Audit on Arbiscan</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] hover:bg-[#201f1f] text-xs font-semibold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Done</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  if (stage === 'Failed') {
    return (
      <div className="flex flex-col items-center justify-between min-h-[350px] p-6 text-center select-none bg-[#1A1A1A]">
        
        {/* Error Header */}
        <div className="mt-4">
          <div className="w-16 h-16 rounded-full bg-[#FF4757]/15 border border-[#FF4757]/30 flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-[#FF4757]" />
          </div>
          <h1 className="font-sans text-xl font-bold text-[#FF4757] mt-4">
            Could not send.
          </h1>
          <p className="font-mono text-xs text-[#b7b5b4] mt-2 max-w-xs mx-auto leading-relaxed">
            {errorMessage || "Couldn't reach that address. Check the email and try again."}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] hover:bg-[#201f1f] text-xs font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Active Sending States ("Routing..." -> "Processing...")
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] py-8 text-center select-none bg-[#1A1A1A]">
      <div className="space-y-6 max-w-xs">
        {/* Dynamic EKG animation representing block routing */}
        <div className="w-full h-16 relative overflow-hidden bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl flex items-center justify-center">
          <EkgWave height={64} speed={stage === 'Routing' ? 2.5 : 1.2} color="#C1121F" strokeWidth={2} glow={true} />
        </div>

        <div className="space-y-3">
          <h3 className="font-sans text-lg font-bold text-[#F5F5F5] tracking-tight">
            {stage === 'Routing' ? 'Routing...' : 'Processing...'}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4] leading-relaxed">
            {stage === 'Routing' 
              ? 'Finding cross-chain paths via Particle UA...' 
              : 'Sponsoring gas & committing state on Arbitrum Sepolia...'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[#C1121F]">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    </div>
  );
}
