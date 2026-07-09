import { NextResponse } from 'next/server';
import { getRealUSDCBalance } from '../../../lib/balance';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

async function handleBalanceRequest(
  address: string | null,
  email: string | null,
  universalAddress: string | null
) {
  const targetAddress = universalAddress || address;
  if (!targetAddress) {
    return NextResponse.json({ error: 'Wallet address is required.' }, { status: 400 });
  }

  // 1. Try to fetch the real on-chain balance first using viem
  const onChainBalance = await getRealUSDCBalance(targetAddress);
  if (onChainBalance !== null) {
    // Save/sync the latest user addresses to Supabase in the background
    if (email && isSupabaseConfigured) {
      const lowerEmail = email.toLowerCase();
      supabase
        .from('users')
        .upsert({
          email: lowerEmail,
          address: address || null,
          universal_address: universalAddress || null,
        }, { onConflict: 'email' })
        .then(({ error }) => {
          if (error) console.error('Error upserting user:', error);
        });
    }
    return NextResponse.json({ balance: onChainBalance });
  }

  // 2. Fallback to mock balance stored in Supabase or hardcoded defaults
  let fallbackBalance = 14250.00; // default initial demo balance
  if (email) {
    const lowerEmail = email.toLowerCase();
    
    // Default mock balance for built-in demo users
    if (
      lowerEmail === 'google-user@pulsepay.com' ||
      lowerEmail === 'sarah.c@pulsepay.com' ||
      lowerEmail === 'toluwanimi006@gmail.com'
    ) {
      fallbackBalance = 13006.00;
    } else {
      fallbackBalance = 1000.00; // Default faucet funds for custom mock users
    }

    if (isSupabaseConfigured) {
      try {
        // Upsert user profile first
        await supabase
          .from('users')
          .upsert({
            email: lowerEmail,
            address: address || null,
            universal_address: universalAddress || null,
          }, { onConflict: 'email' });

        // Calculate their balance by summing all of their transactions in the DB
        const { data: txs, error } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_email', lowerEmail);
        
        if (!error && txs) {
          let calculatedBalance = fallbackBalance;
          txs.forEach((tx) => {
            if (tx.type === 'send') {
              calculatedBalance = Math.max(0, calculatedBalance - Number(tx.amount));
            } else {
              calculatedBalance = calculatedBalance + Number(tx.amount);
            }
          });
          fallbackBalance = calculatedBalance;
        }
      } catch (err) {
        console.error('Error fetching fallback balance from Supabase:', err);
      }
    }
  }

  return NextResponse.json({ balance: fallbackBalance });
}

export async function POST(req: Request) {
  try {
    const { address, email, universalAddress } = await req.json();
    return await handleBalanceRequest(address, email, universalAddress);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Balance retrieval failed.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const email = searchParams.get('email');
    const universalAddress = searchParams.get('universalAddress');
    return await handleBalanceRequest(address, email, universalAddress);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Balance retrieval failed.' }, { status: 500 });
  }
}
