import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { getDb, saveDb } from '../../../lib/db';
import { Transaction } from '../../../lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_email', email.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mapped = (data || []).map((tx) => ({
        id: tx.id,
        type: tx.type,
        partnerName: tx.partner_name,
        partnerEmail: tx.partner_email,
        amount: Number(tx.amount),
        timestamp: tx.timestamp,
        status: tx.status,
        token: tx.token,
        networkFee: tx.network_fee,
        hash: tx.hash,
      }));
      
      return NextResponse.json(mapped);
    }

    // Fallback to local db
    const db = getDb();
    return NextResponse.json(db.transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { type, partnerName, partnerEmail, amount, status, email } = await req.json();

    if (!type || !partnerEmail || amount === undefined || isNaN(Number(amount)) || !email) {
      return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    const lowerEmail = email.toLowerCase();
    const partnerLowerEmail = partnerEmail.toLowerCase();
    const cleanPartnerName = partnerName || (partnerEmail.includes('@') ? partnerEmail.split('@')[0] : partnerEmail);
    const formattedTimestamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const txId = `tx-${Math.random().toString(36).substring(2, 9)}`;

    if (isSupabaseConfigured) {
      // 1. Save transaction log for the main user
      const { error: txError } = await supabase.from('transactions').insert({
        id: txId,
        user_email: lowerEmail,
        type,
        partner_name: cleanPartnerName,
        partner_email: partnerEmail,
        amount: numAmount,
        timestamp: formattedTimestamp,
        status: status || 'Completed',
        token: 'USDC',
        network_fee: 'Sponsored',
      });

      if (txError) throw txError;

      // 2. If it's a transfer between two users, save a corresponding receive transaction for the recipient!
      if (type === 'send' && partnerEmail.includes('@')) {
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
          });
        }
      }

      return NextResponse.json({ success: true }, { status: 201 });
    }

    // Fallback to local db.json
    const db = getDb();
    const newTx: Transaction = {
      id: txId,
      type,
      partnerName: cleanPartnerName,
      partnerEmail,
      amount: numAmount,
      timestamp: formattedTimestamp,
      status: status || 'Completed',
      token: 'USDC',
      networkFee: 'Sponsored',
    };

    db.transactions = [newTx, ...db.transactions];
    if (type === 'send') {
      db.balance = Math.max(0, db.balance - numAmount);
    } else {
      db.balance = db.balance + numAmount;
    }
    saveDb(db);

    return NextResponse.json({ transaction: newTx, balance: db.balance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
