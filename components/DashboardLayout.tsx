'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from './AuthGate';
import Logo from './Logo';
import { Wallet, Send, ReceiptText, Calendar, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Vault', path: '/dashboard', icon: Wallet },
    { name: 'Send', path: '/send', icon: Send },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Activity', path: '/history', icon: ReceiptText },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#131313] border-b md:border-b-0 md:border-r border-[#2A2A2A] flex flex-col justify-between flex-shrink-0 relative z-10">
        
        {/* Header Branding */}
        <div className="p-6 h-16 flex items-center border-b border-[#2A2A2A]">
          <Logo size="sm" layout="horizontal" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-row md:flex-col flex-1 px-4 py-4 md:py-6 flex gap-1.5 overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C1121F]/10 border-[#C1121F]/30 text-[#C1121F]'
                    : 'border-transparent text-[#b7b5b4] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="hidden md:flex flex-col mt-auto">
          {/* Status System */}
          <div className="px-6 py-3.5 flex items-center gap-2.5 border-t border-[#2A2A2A]">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#b7b5b4]">System Operational</span>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#C1121F] text-xs font-bold font-mono">
                {email ? email.substring(0, 2).toUpperCase() : 'PP'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-medium text-[#F5F5F5] truncate">{email}</p>
                <p className="text-[10px] text-[#b7b5b4] uppercase tracking-wider">Smart Account</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[#b7b5b4] hover:text-[#C1121F] p-1.5 rounded-xl hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Stage */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0A0A0A] relative z-0 flex flex-col">
        {/* Top Header info */}
        <header className="h-16 border-b border-[#2A2A2A] bg-[#131313]/50 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#b7b5b4] hidden sm:inline">Network:</span>
            <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-xl border border-[#10B981]/20">Arbitrum Sepolia L2 (7702)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/send')}
              className="bg-[#C1121F] hover:bg-[#a00f1a] text-white text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Send
            </button>
            <button
              onClick={logout}
              className="md:hidden text-[#b7b5b4] hover:text-[#C1121F] p-1.5 rounded-xl border border-[#2A2A2A] transition-colors cursor-pointer"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Child components */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
