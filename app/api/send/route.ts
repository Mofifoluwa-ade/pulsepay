import { NextResponse } from 'next/server';
import { ua } from '../../../lib/particle';
import { getZeroDevClient } from '../../../lib/zerodev';
import { getDb, saveDb } from '../../../lib/db';
import { Transaction } from '../../../lib/types';

export async function POST(req: Request) {
  try {
    const { from, toEmail, amount } = await req.json();

    if (!from || !toEmail || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Invalid transaction parameters.' }, { status: 400 });
    }

    const numAmount = Number(amount);

    // 1. Resolve recipient email → address (or create pending wallet)
    const baseUrl = new URL(req.url).origin;
    const resolveRes = await fetch(`${baseUrl}/api/resolve-recipient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail }),
    });

    let recipientAddress = '';
    if (resolveRes.ok) {
      const resolveData = await resolveRes.json();
      recipientAddress = resolveData.address;
    } else {
      throw new Error('Could not resolve recipient email to wallet address.');
    }

    // 2. Build UA cross-chain transfer (satisfies UA Track requirement)
    const tx = await ua.buildTransfer({
      from,
      to: recipientAddress,
      token: 'USDC',
      amount: numAmount,
    });

    // 3. ZeroDev sponsors gas — user pays nothing
    const kernelClient = await getZeroDevClient(from);
    const txHash = await kernelClient.sendUserOperation({
      userOperation: tx.userOp,
    });

    // 4. Update the local persistent DB balance & transactions
    const db = getDb();
    
    const partnerName = toEmail.includes('@') ? toEmail.split('@')[0] : toEmail;
    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substring(2, 9)}`,
      type: 'send',
      partnerName,
      partnerEmail: toEmail,
      amount: numAmount,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed',
      token: 'USDC',
      networkFee: 'Sponsored',
      hash: txHash,
    };

    db.transactions = [newTx, ...db.transactions];
    db.balance = Math.max(0, db.balance - numAmount);
    saveDb(db);

    return NextResponse.json({ txHash, status: 'pending' });
  } catch (error: any) {
    console.error('Send API route error:', error);
    return NextResponse.json({ error: error.message || 'Transaction dispatch failed.' }, { status: 500 });
  }
}
