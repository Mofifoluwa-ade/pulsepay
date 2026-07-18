'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from './AuthGate';
import { motion } from 'framer-motion';
import { Check, X, Loader2, ArrowUpRight, Copy } from 'lucide-react';
import EkgWave from './EkgWave';

interface TxStatusProps {
  toEmail: string;
  amount: number;
  from: string;
  onClose: () => void;
}

type Stage = 'Confirm' | 'Routing' | 'Processing' | 'Completed' | 'Failed';

export default function TxStatus({ toEmail, amount, from, onClose }: TxStatusProps) {
  const { email, refreshBalance } = useUser();
  const [stage, setStage] = useState<Stage>('Confirm');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [friendName, setFriendName] = useState('');
  const [isAddedToFriends, setIsAddedToFriends] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  // Check if recipient is already in friend list using database API
  useEffect(() => {
    if (stage === 'Completed' && email) {
      const checkFriend = async () => {
        try {
          const res = await fetch(`/api/friends?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const list = await res.json();
            const exists = list.some((f: any) => f.email.toLowerCase() === toEmail.toLowerCase());
            setIsAddedToFriends(exists);
          }
        } catch (e) {
          console.error('Error checking friends list:', e);
        }
      };
      checkFriend();
      
      // Pre-fill friend nickname with email prefix
      const prefix = toEmail.split('@')[0];
      setFriendName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
    }
  }, [stage, toEmail, email]);

  const handleAddToFriends = async () => {
    if (!email) return;
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          friendEmail: toEmail,
          friendName: friendName.trim() || toEmail.split('@')[0],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save friend in database');
      }

      setIsAddedToFriends(true);
      setIsAddingFriend(false);
    } catch (e) {
      console.error('Error saving friend:', e);
      alert('Could not save friend to database.');
    }
  };

  // Execute the transaction request
  useEffect(() => {
    // Only execute on-chain calls once the user authorizes/confirms the transaction
    if (stage !== 'Routing') return;

    let active = true;
    let pollInterval: NodeJS.Timeout;

    const startTransaction = async () => {
      try {
        // 1. Post to send API
        const res = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, toEmail, amount, email }),
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
  }, [from, toEmail, amount, stage]);

  // Mini Receipt Confirmation Card
  if (stage === 'Confirm') {
    const getRecipientName = (emailStr: string) => {
      const prefix = emailStr.split('@')[0];
      const cleanName = prefix.split('.')[0].split('_')[0];
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    };

    return (
      <div className="flex flex-col items-center justify-between min-h-[360px] p-6 text-center select-none bg-[#1A1A1A] z-10 w-full animate-fade-in">
        <div className="w-full space-y-4">
          
          {/* Header */}
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/40">Authorization Gate</span>
            <h1 className="font-sans text-lg font-bold text-[#F5F5F5]">Confirm Payment</h1>
          </div>

          {/* Ticket styling receipt */}
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-5 text-left font-mono text-[10px] space-y-3.5 shadow-inner relative">
            <div className="flex justify-between items-baseline">
              <span className="text-[#b7b5b4]/50">RECIPIENT NAME:</span>
              <span className="text-[#F5F5F5] font-sans font-semibold text-xs">{getRecipientName(toEmail)}</span>
            </div>
            
            <div className="flex justify-between items-baseline">
              <span className="text-[#b7b5b4]/50">EMAIL ADDRESS:</span>
              <span className="text-[#F5F5F5] font-semibold truncate max-w-[150px]" title={toEmail}>{toEmail}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[#b7b5b4]/50">ROUTING CHAIN:</span>
              <span className="text-[#F5F5F5] uppercase text-[9px]">Arbitrum Sepolia L2</span>
            </div>

            <div className="border-t border-dashed border-[#2A2A2A]/80 my-3.5" />

            <div className="flex justify-between items-baseline">
              <span className="text-[#b7b5b4]/50">AMOUNT:</span>
              <div className="text-right">
                <span className="text-[#F5F5F5] font-sans text-sm font-bold">${amount.toFixed(2)}</span>
                <span className="text-[8px] text-[#b7b5b4]/30 ml-1">USDC</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[#b7b5b4]/50">TRANSFER FEES:</span>
              <span className="text-[#10B981] font-semibold uppercase tracking-wider text-[9px]">100% Sponsored</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-3.5 mt-6 z-10">
          <button
            onClick={onClose}
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] hover:bg-[#201f1f] text-xs font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => setStage('Routing')}
            className="flex-1 bg-[#C1121F] hover:bg-[#a00f1a] text-white text-xs font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#C1121F]/10 font-sans"
          >
            <span>Authorize</span>
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'Completed') {
    return (
      <div className="relative flex flex-col items-center justify-between min-h-[380px] p-6 text-center select-none bg-[#1A1A1A] z-10 w-full">
        
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

        {/* Friend List Save Action */}
        <div className="relative z-10 w-full max-w-xs mt-4 p-3.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl flex flex-col gap-2">
          {isAddedToFriends ? (
            <div className="flex items-center justify-center gap-2 text-[#10B981] font-mono text-[10px] uppercase tracking-wider py-1.5">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              <span>Saved in Friends</span>
            </div>
          ) : !isAddingFriend ? (
            <button
              onClick={() => setIsAddingFriend(true)}
              className="w-full border border-dashed border-[#2A2A2A] hover:border-[#C1121F] text-[#b7b5b4] hover:text-[#F5F5F5] font-mono text-[10px] uppercase tracking-wider py-2 rounded-lg transition-colors cursor-pointer"
            >
              + Add to Friend List
            </button>
          ) : (
            <div className="space-y-2 text-left">
              <span className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/50 block">Friend Nickname</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="Nickname"
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] rounded-xl px-2.5 py-1.5 font-sans text-xs outline-none focus:border-[#C1121F] transition-colors"
                />
                <button
                  onClick={handleAddToFriends}
                  className="bg-[#C1121F] hover:bg-[#a00f1a] text-white font-mono text-[10px] uppercase px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          )}
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
      <div className="flex flex-col items-center justify-between min-h-[350px] p-6 text-center select-none bg-[#1A1A1A] w-full">
        
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
    <div className="flex flex-col items-center justify-center min-h-[350px] py-8 text-center select-none bg-[#1A1A1A] w-full">
      <div className="space-y-6 max-w-xs w-full">
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
