import { NextResponse } from 'next/server';
import { getDb, saveDb } from '../../../lib/db';
import { Transaction } from '../../../lib/types';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json(db.transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { type, partnerName, partnerEmail, amount, status } = await req.json();

    if (!type || !partnerEmail || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    const db = getDb();

    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 9)}`,
      type,
      partnerName: partnerName || (partnerEmail.includes('@') ? partnerEmail.split('@')[0] : partnerEmail),
      partnerEmail,
      amount: numAmount,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: status || 'Completed',
      token: 'USDC',
      networkFee: 'Sponsored',
    };

    // Update in-memory/file database
    db.transactions = [newTx, ...db.transactions];
    
    if (type === 'send') {
      db.balance = Math.max(0, db.balance - numAmount);
    } else {
      // receive or swap adds to balance
      db.balance = db.balance + numAmount;
    }

    saveDb(db);

    return NextResponse.json({ transaction: newTx, balance: db.balance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
