import { Contact, Transaction } from '@/types'

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alex Kim',
    email: 'alex@gmail.com',
    initials: 'AK',
    color: '#1f1a2e',
    textColor: '#a78bfa',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah@mail.com',
    initials: 'SW',
    color: '#1a2e1f',
    textColor: '#10b981',
  },
  {
    id: '3',
    name: 'Ola Tunde',
    email: 'ola@lagos.dev',
    initials: 'OT',
    color: '#2e2a1a',
    textColor: '#fbbf24',
  },
  {
    id: '4',
    name: 'Nadia Burak',
    email: 'nadia@work.io',
    initials: 'NB',
    color: '#1a2432',
    textColor: '#60a5fa',
  },
  {
    id: '5',
    name: 'James Doe',
    email: 'james@proton.me',
    initials: 'JD',
    color: '#2e1a1a',
    textColor: '#f87171',
  },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    direction: 'sent',
    counterparty: MOCK_CONTACTS[0],
    amount: 50,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    network: 'Arbitrum One',
  },
  {
    id: 'tx2',
    direction: 'received',
    counterparty: MOCK_CONTACTS[1],
    amount: 120,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    network: 'Arbitrum One',
  },
  {
    id: 'tx3',
    direction: 'sent',
    counterparty: MOCK_CONTACTS[4],
    amount: 30,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    network: 'Arbitrum One',
  },
  {
    id: 'tx4',
    direction: 'received',
    counterparty: MOCK_CONTACTS[3],
    amount: 75,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    network: 'Arbitrum One',
  },
  {
    id: 'tx5',
    direction: 'sent',
    counterparty: MOCK_CONTACTS[2],
    amount: 200,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    network: 'Arbitrum One',
  },
]

export const MOCK_BALANCE = 284.5
