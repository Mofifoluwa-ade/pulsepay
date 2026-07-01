// ── User ──────────────────────────────────────────────
export interface User {
  email: string
  address: string
  initials: string
}

// ── Contact ───────────────────────────────────────────
export interface Contact {
  id: string
  name: string
  email: string
  initials: string
  color: string        // bg color token
  textColor: string
}

// ── Transaction ───────────────────────────────────────
export type TxDirection = 'sent' | 'received'
export type TxStatus = 'pending' | 'confirmed' | 'failed'

export interface Transaction {
  id: string
  direction: TxDirection
  counterparty: Contact
  amount: number       // in USD
  status: TxStatus
  timestamp: Date
  txHash?: string
  network: string
}

// ── Send flow ─────────────────────────────────────────
export interface SendPayload {
  toEmail: string
  toName: string
  amount: number
}

export type ProcessingStep =
  | 'routing'
  | 'gas'
  | 'settling'
  | 'done'

export type StepStatus = 'idle' | 'active' | 'done'

export interface SendStep {
  id: ProcessingStep
  label: string
  status: StepStatus
}

// ── App context ───────────────────────────────────────
export type AppScreen = 'login' | 'dashboard' | 'send' | 'confirm'

export interface AppContextValue {
  user: User | null
  setUser: (u: User | null) => void
  balance: number
  transactions: Transaction[]
  currentScreen: AppScreen
  navigateTo: (screen: AppScreen) => void
  pendingSend: SendPayload | null
  setPendingSend: (p: SendPayload | null) => void
}
