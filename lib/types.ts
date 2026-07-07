export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  partnerName: string;
  partnerEmail: string;
  amount: number;
  timestamp: string;
  status: 'Routing' | 'Processing' | 'Completed' | 'Failed';
  token?: string; // e.g. "USDC"
  networkFee?: string; // e.g. "Sponsored"
  hash?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  address?: string;
  initials: string;
}

export interface UserProfile {
  email: string;
  balance: number;
  address: string;          // Embed address
  universalAddress: string;  // Particle EIP-7702 Address
}

export interface ScheduledPayment {
  id: string;
  recipientEmail: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  nextExecution: string;
  status: 'active' | 'paused' | 'executed';
}
