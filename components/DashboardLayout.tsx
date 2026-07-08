'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from './AuthGate';
import Logo from './Logo';
import { Wallet, Send, ReceiptText, Calendar, LogOut, Menu, QrCode, X, Camera, CameraOff, Check } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let scanTimeout: NodeJS.Timeout;

    if (isScannerOpen) {
      setScannerStatus('scanning');
      setScannedResult(null);
      setHasCamera(true);
      
      const setupCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' }
            });
            activeStream = stream;
            setCameraStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (err) {
            console.warn('Camera error:', err);
            setHasCamera(false);
          }
        } else {
          setHasCamera(false);
        }
      };

      setupCamera();

      // Automatically mock-scan after 2.5 seconds
      scanTimeout = setTimeout(() => {
        handleSuccessScan('alex@pulsepay.com');
      }, 2500);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      setCameraStream(null);
      clearTimeout(scanTimeout);
    };
  }, [isScannerOpen]);

  const handleSuccessScan = (emailResult: string) => {
    setScannerStatus('success');
    setScannedResult(emailResult);
    
    // Play a mock beep using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Web Audio beep failed:', e);
    }

    // Dispatch custom event to let SendForm know
    window.dispatchEvent(new CustomEvent('pulsepay-qr-scanned', {
      detail: { value: emailResult }
    }));

    // Auto close scanner after success view
    setTimeout(() => {
      setIsScannerOpen(false);
    }, 1200);
  };

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
            {pathname === '/send' ? (
              <button
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 bg-[#C1121F] hover:bg-[#a00f1a] text-white text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer border border-transparent shadow-md shadow-[#C1121F]/10 animate-fade-in"
              >
                <QrCode className="w-4 h-4 animate-pulse" />
                <span>Scan QR</span>
              </button>
            ) : (
              <button
                onClick={() => router.push('/send')}
                className="bg-[#C1121F] hover:bg-[#a00f1a] text-white text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Send
              </button>
            )}
          </div>
        </header>

        {/* Child components */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Scanner Modal overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">PulsePay Scanner</span>
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="text-[#b7b5b4]/60 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Viewport / Viewfinder */}
            <div className="w-full aspect-square bg-black border border-[#2A2A2A] rounded-2xl relative overflow-hidden shadow-inner flex items-center justify-center">
              
              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#C1121F] rounded-tl-sm pointer-events-none z-20" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#C1121F] rounded-tr-sm pointer-events-none z-20" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#C1121F] rounded-bl-sm pointer-events-none z-20" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#C1121F] rounded-br-sm pointer-events-none z-20" />

              {/* Scanning sweep laser line */}
              {scannerStatus === 'scanning' && (
                <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10 animate-laser-sweep" />
              )}

              {/* Success Backdrop */}
              {scannerStatus === 'success' && (
                <div className="absolute inset-0 bg-[#10B981]/10 backdrop-blur-2xs flex flex-col items-center justify-center z-30 animate-scale-up">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mb-2">
                    <Check className="w-8 h-8" />
                  </div>
                  <span className="font-mono text-xs text-[#10B981] font-semibold">QR Code Scanned</span>
                </div>
              )}

              {/* Real Video Element */}
              {hasCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-2xl pointer-events-none"
                />
              ) : (
                /* Simulated Scanner Grid */
                <div className="w-full h-full bg-[#0A0A0A] flex flex-col items-center justify-center p-6 space-y-3 z-0">
                  <div className="w-12 h-12 rounded-full border border-dashed border-[#b7b5b4]/20 flex items-center justify-center text-[#b7b5b4]/40 animate-spin">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-mono text-[10px] text-[#b7b5b4]/60 uppercase tracking-wider">Simulating Feed...</p>
                    <p className="font-sans text-[10px] text-[#b7b5b4]/35">Camera unavailable or permission required</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instruction / Result text */}
            <div className="space-y-1 text-center min-h-[44px] flex flex-col justify-center">
              {scannerStatus === 'scanning' ? (
                <>
                  <p className="text-xs text-[#F5F5F5] font-sans">Align the recipient's QR code in the frame</p>
                  <p className="text-[9px] font-mono text-[#b7b5b4]/40 uppercase tracking-widest animate-pulse">Initializing camera stream...</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[#10B981] font-mono font-medium truncate">Detected: {scannedResult}</p>
                  <p className="text-[9px] font-mono text-[#b7b5b4]/40 uppercase tracking-widest">Routing pay-flow...</p>
                </>
              )}
            </div>

            {/* Simulated Targets Switcher (Extremely cool for testing!) */}
            {scannerStatus === 'scanning' && (
              <div className="space-y-2 pt-2 border-t border-[#2A2A2A]/40">
                <p className="font-mono text-[8px] uppercase tracking-widest text-[#b7b5b4]/40">Demo Quick Scans</p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleSuccessScan('alex@pulsepay.com')}
                    className="px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C1121F] rounded-lg font-mono text-[9px] text-[#b7b5b4] hover:text-[#F5F5F5] transition-all cursor-pointer"
                  >
                    Alex
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuccessScan('sarah@mail.com')}
                    className="px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C1121F] rounded-lg font-mono text-[9px] text-[#b7b5b4] hover:text-[#F5F5F5] transition-all cursor-pointer"
                  >
                    Sarah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSuccessScan('toluwanimi006@gmail.com')}
                    className="px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C1121F] rounded-lg font-mono text-[9px] text-[#b7b5b4] hover:text-[#F5F5F5] transition-all cursor-pointer"
                  >
                    Mofi
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            <button 
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="w-full bg-[#1A1A1A] hover:bg-[#201f1f] text-[#b7b5b4] hover:text-[#F5F5F5] border border-[#2A2A2A] font-sans text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* slide-in and scanner animation styles */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes laser-sweep {
          0% { top: 16px; opacity: 0.8; }
          50% { top: calc(100% - 18px); opacity: 1; }
          100% { top: 16px; opacity: 0.8; }
        }
        .animate-laser-sweep {
          animation: laser-sweep 2s ease-in-out infinite;
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }
      `}</style>

    </div>
  );
}
