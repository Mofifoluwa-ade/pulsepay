import { NextResponse } from 'next/server';
import { ua } from '../../../lib/particle';
import { getZeroDevClient } from '../../../lib/zerodev';
import { getDb, saveDb } from '../../../lib/db';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { Transaction } from '../../../lib/types';

export async function POST(req: Request) {
  try {
    const { from, toEmail, amount, email } = await req.json();

    if (!from || !toEmail || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Invalid transaction parameters.' }, { status: 400 });
    }

    const numAmount = Number(amount);

    // 1. Resolve recipient email → address (checking Supabase first, then falling back to deterministic registry)
    let recipientAddress = '';
    if (isSupabaseConfigured) {
      const { data: recipientUser } = await supabase
        .from('users')
        .select('universal_address, address')
        .eq('email', toEmail.toLowerCase())
        .single();
      
      if (recipientUser) {
        recipientAddress = recipientUser.universal_address || recipientUser.address || '';
      }
    }

    if (!recipientAddress) {
      const baseUrl = new URL(req.url).origin;
      const resolveRes = await fetch(`${baseUrl}/api/resolve-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: toEmail }),
      });

      if (resolveRes.ok) {
        const resolveData = await resolveRes.json();
        recipientAddress = resolveData.address;
      } else {
        throw new Error('Could not resolve recipient email to wallet address.');
      }
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

    // 4. Update the DB balance & transactions
    const partnerName = toEmail.includes('@') ? toEmail.split('@')[0] : toEmail;
    const cleanPartnerName = partnerName.charAt(0).toUpperCase() + partnerName.slice(1);
    const formattedTimestamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const txId = `tx-${Math.random().toString(36).substring(2, 9)}`;

    if (isSupabaseConfigured && email) {
      const lowerEmail = email.toLowerCase();
      const partnerLowerEmail = toEmail.toLowerCase();

      // Log transaction for sender
      await supabase.from('transactions').insert({
        id: txId,
        user_email: lowerEmail,
        type: 'send',
        partner_name: cleanPartnerName,
        partner_email: toEmail,
        amount: numAmount,
        timestamp: formattedTimestamp,
        status: 'Completed',
        token: 'USDC',
        network_fee: 'Sponsored',
        hash: txHash,
      });

      // Log transaction for recipient if they exist in users table
      const { data: recipientExists } = await supabase
        .from('users')
        .select('email')
        .eq('email', partnerLowerEmail)
        .single();

      if (recipientExists) {
        const recipientTxId = `tx-${Math.random().toString(36).substring(2, 9)}`;
        const senderName = lowerEmail.split('@')[0];
        const cleanSenderName = senderName.charAt(0).toUpperCase() + senderName.slice(1);

        await supabase.from('transactions').insert({
          id: recipientTxId,
          user_email: partnerLowerEmail,
          type: 'receive',
          partner_name: cleanSenderName,
          partner_email: email,
          amount: numAmount,
          timestamp: formattedTimestamp,
          status: 'Completed',
          token: 'USDC',
          network_fee: 'Sponsored',
          hash: txHash,
        });
      }
    } else {
      // Fallback to local db.json
      const db = getDb();
      const newTx: Transaction = {
        id: txId,
        type: 'send',
        partnerName: cleanPartnerName,
        partnerEmail: toEmail,
        amount: numAmount,
        timestamp: formattedTimestamp,
        status: 'Completed',
        token: 'USDC',
        networkFee: 'Sponsored',
        hash: txHash,
      };

      db.transactions = [newTx, ...db.transactions];
      db.balance = Math.max(0, db.balance - numAmount);
      saveDb(db);
    }

    return NextResponse.json({ txHash, status: 'pending' });
  } catch (error: any) {
    console.error('Send API route error:', error);
    return NextResponse.json({ error: error.message || 'Transaction dispatch failed.' }, { status: 500 });
  }
}
