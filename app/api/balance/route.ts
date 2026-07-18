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

  // 2. Return 0.00 if balance cannot be fetched
  return NextResponse.json({ balance: 0.00 });
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
