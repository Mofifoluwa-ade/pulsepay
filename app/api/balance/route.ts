import { NextResponse } from 'next/server';
import { ua } from '../../../lib/particle';
import { getDb } from '../../../lib/db';

async function handleBalanceRequest(address: string | null) {
  if (!address) {
    return NextResponse.json({ error: 'Wallet address is required.' }, { status: 400 });
  }

  // 1. Fetch balance from Particle SDK
  const sdkBalance = await ua.getUnifiedBalance(address);
  
  // 2. Fetch balance from persistent DB
  const db = getDb();
  
  // Fallback to local db balance if Particle is in mock/demo mode
  const finalBalance = typeof sdkBalance === 'number' 
    ? sdkBalance 
    : (sdkBalance.total !== undefined ? sdkBalance.total : db.balance);

  return NextResponse.json({ balance: finalBalance });
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    return await handleBalanceRequest(address);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Balance retrieval failed.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    return await handleBalanceRequest(address);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Balance retrieval failed.' }, { status: 500 });
  }
}
