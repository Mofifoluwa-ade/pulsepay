'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { magic } from '../lib/magic';
import { upgradeToUniversalAccount } from '../lib/particle';
import { Activity, ShieldAlert } from 'lucide-react';
import EkgWave from './EkgWave';

interface UserContextType {
  email: string | null;
  address: string | null;            // Magic signers address
  universalAddress: string | null;   // EIP-7702 UA address
  balance: number;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [universalAddress, setUniversalAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(14250.00);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  const loadSession = async () => {
    try {
      const isPublicRoute = pathname === '/' || pathname === '/login';
      const hasLoginFlag = localStorage.getItem('pulsepay_logged_in') === 'true';

      // 1. Optimistic bypass for logged-out users visiting public routes (0ms block!)
      if (!hasLoginFlag && isPublicRoute) {
        setLoading(false);
        verifySessionSilent();
        return;
      }

      // 2. Full session verification
      await verifySession();
    } catch (error) {
      console.error('Error loading session:', error);
      setLoading(false);
    }
  };

  const verifySessionSilent = async () => {
    try {
      if (!magic) {
        const storedEmail = localStorage.getItem('pulsepay_mock_email');
        if (storedEmail) {
          setEmail(storedEmail);
          const mockAddr = '0x' + Array.from(storedEmail).map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 40).padEnd(40, '0');
          setAddress(mockAddr);
          localStorage.setItem('pulsepay_logged_in', 'true');
          const uaRes = await upgradeToUniversalAccount(mockAddr);
          setUniversalAddress(uaRes.address);
          fetchBalance(uaRes.address);
        }
        return;
      }

      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const metadata = await magic.user.getInfo();
        if (metadata.email && metadata.publicAddress) {
          setEmail(metadata.email);
          setAddress(metadata.publicAddress);
          localStorage.setItem('pulsepay_logged_in', 'true');
          const uaRes = await upgradeToUniversalAccount(metadata.publicAddress);
          setUniversalAddress(uaRes.address);
          fetchBalance(uaRes.address);
        }
      }
    } catch (e) {
      console.error('Silent session check failed:', e);
    }
  };

  const verifySession = async () => {
    try {
      if (!magic) {
        const storedEmail = localStorage.getItem('pulsepay_mock_email');
        if (storedEmail) {
          setEmail(storedEmail);
          const mockAddr = '0x' + Array.from(storedEmail).map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 40).padEnd(40, '0');
          setAddress(mockAddr);
          localStorage.setItem('pulsepay_logged_in', 'true');

          // Non-blocking background fetch of Universal Account & Balance
          upgradeToUniversalAccount(mockAddr).then((uaRes) => {
            setUniversalAddress(uaRes.address);
            fetchBalance(uaRes.address);
          });
        } else {
          localStorage.removeItem('pulsepay_logged_in');
        }
        setLoading(false);
        return;
      }

      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const metadata = await magic.user.getInfo();
        if (metadata.email && metadata.publicAddress) {
          setEmail(metadata.email);
          setAddress(metadata.publicAddress);
          localStorage.setItem('pulsepay_logged_in', 'true');

          // Non-blocking background fetch of Universal Account & Balance
          upgradeToUniversalAccount(metadata.publicAddress).then((uaRes) => {
            setUniversalAddress(uaRes.address);
            fetchBalance(uaRes.address);
          });
        }
      } else {
        localStorage.removeItem('pulsepay_logged_in');
      }
    } catch (error) {
      console.error('Error verifying Magic session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (uaAddr: string) => {
    try {
      const res = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: uaAddr }),
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance.total ?? data.balance);
      }
    } catch (e) {
      console.error('Error fetching balance from API:', e);
    }
  };

  const refreshBalance = async () => {
    if (universalAddress) {
      await fetchBalance(universalAddress);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  // Redirect Logic
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/' || pathname === '/login';
    const hasActiveSession = !!email;

    if (!hasActiveSession && !isPublicRoute) {
      router.push('/');
    } else if (hasActiveSession && isPublicRoute) {
      router.push('/dashboard');
    }
  }, [email, pathname, loading]);

  const login = async (inputEmail: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!magic || process.env.NEXT_PUBLIC_MAGIC_KEY === 'pk_live_mock_key' || !process.env.NEXT_PUBLIC_MAGIC_KEY) {
        // Mock Login Flow
        localStorage.setItem('pulsepay_mock_email', inputEmail);
        localStorage.setItem('pulsepay_logged_in', 'true');
        setEmail(inputEmail);
        const mockAddr = '0x' + Array.from(inputEmail).map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 40).padEnd(40, '0');
        setAddress(mockAddr);

        const uaRes = await upgradeToUniversalAccount(mockAddr);
        setUniversalAddress(uaRes.address);

        setLoading(false);
        router.push('/dashboard');
        return true;
      }

      // Real Magic Login
      await magic.auth.loginWithEmailOTP({ email: inputEmail });
      const metadata = await magic.user.getInfo();

      if (metadata.email && metadata.publicAddress) {
        setEmail(metadata.email);
        setAddress(metadata.publicAddress);
        localStorage.setItem('pulsepay_logged_in', 'true');

        const uaRes = await upgradeToUniversalAccount(metadata.publicAddress);
        setUniversalAddress(uaRes.address);

        await fetchBalance(uaRes.address);

        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Please check your console log or retry.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (magic) {
        await magic.user.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('pulsepay_mock_email');
      localStorage.removeItem('pulsepay_logged_in');
      setEmail(null);
      setAddress(null);
      setUniversalAddress(null);
      setLoading(false);
      router.push('/');
    }
  };

  const isPublicRoute = pathname === '/' || pathname === '/login';

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#F5F5F5] font-mono select-none">
        <Activity className="text-[#C1121F] w-12 h-12 animate-pulse mb-4" />
        <span className="text-xs uppercase tracking-widest text-[#b7b5b4]">Verifying cryptographic session...</span>
        <div className="w-64 mt-4 h-16 opacity-30 overflow-hidden relative border border-[#2A2A2A] rounded">
          <EkgWave height={64} speed={2} color="#C1121F" strokeWidth={1} glow={false} />
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{
      email,
      address,
      universalAddress,
      balance,
      loading,
      login,
      logout,
      refreshBalance
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthGate/Provider');
  }
  return context;
}
