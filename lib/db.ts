import fs from 'fs';
import path from 'path';
import { Transaction, ScheduledPayment } from './types';

const dbPath = path.join(process.cwd(), 'db.json');

interface DbSchema {
  balance: number;
  transactions: Transaction[];
  scheduledPayments: ScheduledPayment[];
}

function initDb() {
  if (!fs.existsSync(dbPath)) {
    const defaultData: DbSchema = {
      balance: 14250.00,
      transactions: [
        {
          id: 'tx-1',
          type: 'send',
          partnerName: 'Alex K.',
          partnerEmail: 'alex@pulsepay.com',
          amount: 50.00,
          timestamp: 'Today, 14:23',
          status: 'Completed',
          token: 'USDC',
          networkFee: 'Sponsored',
        },
        {
          id: 'tx-2',
          type: 'receive',
          partnerName: 'Sarah Williams',
          partnerEmail: 'sarah@mail.com',
          amount: 120.00,
          timestamp: 'Yesterday, 09:12',
          status: 'Completed',
          token: 'USDC',
          networkFee: 'Sponsored',
        },
      ],
      scheduledPayments: [
        {
          id: 'sp-1',
          recipientEmail: 'alex@pulsepay.com',
          amount: 15.00,
          frequency: 'weekly',
          nextExecution: 'Next Monday, 10:00 AM',
          status: 'active',
        }
      ]
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  } else {
    // Add scheduledPayments key to existing database files if it is missing
    try {
      const raw = fs.readFileSync(dbPath, 'utf8');
      const data = JSON.parse(raw);
      if (!data.scheduledPayments) {
        data.scheduledPayments = [];
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.error('Error migrating DB schema:', e);
    }
  }
}

export function getDb(): DbSchema {
  initDb();
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

export function saveDb(data: DbSchema) {
  initDb();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
