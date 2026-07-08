'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from './AuthGate';
import Logo from './Logo';
import { Wallet, Send, ReceiptText, Calendar, LogOut, Menu, QrCode } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Vault', path: '/dashboard', icon: Wallet },
    { name: 'Send', path: '/send', icon: Send },
    { name: 'Receive', path: '/receive', icon: QrCode },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Activity', path: '/history', icon: ReceiptText },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMenuOpen(false); // Auto-close drawer on navigation
  };

  // Shared Sidebar Content
  const SidebarContent = () => (
    <>
      <div className="flex flex-col flex-1">
        {/* Header Branding */}
        <div className="p-6 h-16 flex items-center border-b border-[#2A2A2A]">
          <Logo size="sm" layout="horizontal" />
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-6 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
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
      </div>

      {/* Footer Area */}
      <div className="flex flex-col mt-auto">
        {/* Status System */}
        <div className="px-6 py-3.5 flex items-center gap-2.5 border-t border-[#2A2A2A]">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#b7b5b4]">System Operational</span>
        </div>

        {/* User Section */}
        <div 
          onClick={() => handleNavClick('/profile')}
          className="p-4 border-t border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]/50 hover:bg-[#1A1A1A] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#C1121F] text-xs font-bold font-mono">
              {email ? email.substring(0, 2).toUpperCase() : 'PP'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-medium text-[#F5F5F5] truncate hover:text-[#C1121F] transition-colors">{email}</p>
              <p className="text-[10px] text-[#b7b5b4] uppercase tracking-wider">Smart Account</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent routing to /profile on sign out click
              logout();
            }}
            className="text-[#b7b5b4] hover:text-[#C1121F] p-1.5 rounded-xl hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans flex overflow-hidden select-none">
      
      {/* 1. Desktop Static Sidebar (Visible on md and up) */}
      <aside className="hidden md:flex md:w-64 bg-[#131313] border-r border-[#2A2A2A] flex-col justify-between flex-shrink-0 relative z-20">
        <SidebarContent />
      </aside>

      {/* 2. Mobile Drawer Sidebar (Slide-out menu visible when toggled) */}
      {isMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Slide-out Sidebar Drawer */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-[#131313] border-r border-[#2A2A2A] flex flex-col justify-between z-50 md:hidden animate-slide-in">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0A0A0A] relative z-0 flex flex-col">
        {/* Top Header bar */}
        <header className="h-16 border-b border-[#2A2A2A] bg-[#131313]/50 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-[#b7b5b4] hover:text-[#F5F5F5] p-2 -ml-2 rounded-xl transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
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
          </div>
        </header>

        {/* Child components */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* slide-in animation styles */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}
