import type { Metadata } from 'next';
import { AuthGate } from '../components/AuthGate';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulsePay — Sub-second USDC Settlements',
  description: 'High-fidelity gas-less financial infrastructure powered by Particle UA and ZeroDev.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased min-h-screen">
        <AuthGate>
          {children}
        </AuthGate>
      </body>
    </html>
  );
}
