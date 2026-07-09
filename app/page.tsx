'use client';

import React, { useState } from 'react';
import { useUser } from '../components/AuthGate';
import { motion } from 'motion/react';
import Logo from '../components/Logo';
import { Mail, ArrowRight, Chrome } from 'lucide-react';

export default function Home() {
  const { login, loginWithGoogle } = useUser();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    
    const success = await login(email);
    if (!success) {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    // Standard OAuth Google Login or fallback email simulator
    await loginWithGoogle();
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#C1121F] opacity-5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md z-10 space-y-8 flex flex-col items-center"
      >
        {/* Logo & Tagline */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo size="lg" layout="horizontal" />
          <p className="text-sm text-[#b7b5b4] tracking-tight font-normal">
            Send money in a heartbeat
          </p>
        </div>

        {/* Input Card */}
        <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,42,42,0.4)_0%,transparent_60%)] pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label htmlFor="email" className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input 
                  id="email"
                  type="email" 
                  required
                  placeholder="name@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] font-sans text-sm px-4 py-3.5 rounded-xl outline-none focus:border-[#C1121F] transition-colors placeholder-[#b7b5b4]/20"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-[#C1121F] text-white font-sans text-sm font-semibold py-3.5 rounded-xl hover:bg-[#a00f1a] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-2 z-10">
            <div className="flex-grow border-t border-[#2A2A2A]"></div>
            <span className="flex-shrink-0 mx-4 font-mono text-[10px] uppercase tracking-widest text-[#b7b5b4]/40">or</span>
            <div className="flex-grow border-t border-[#2A2A2A]"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] font-sans text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#201f1f] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 z-10 relative"
          >
            <Chrome className="w-4 h-4 text-[#b7b5b4]" />
            <span>Continue with Google</span>
          </button>
        </div>
      </motion.div>
      
      {/* Footer */}
      <footer className="absolute bottom-6 text-center z-10">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/30">
          PulsePay &copy; 2026 · All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
