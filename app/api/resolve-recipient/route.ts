import { NextResponse } from 'next/server';
import { keccak256, toHex } from 'viem';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    // 1. Generate email hash for resolving / smart contract mapping
    const emailHash = keccak256(toHex(email.toLowerCase()));

    // 2. Perform registry lookup or derive mock deterministic wallet
    // We derive a deterministic address from the email hash to simulate a pending wallet address
    const mockDerivedAddress = '0x' + emailHash.substring(26, 66);

    return NextResponse.json({ 
      email, 
      emailHash,
      address: mockDerivedAddress,
      isRegistered: email.includes('@pulsepay.com') || email.includes('vitalik')
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Recipient resolution failed.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email query parameter is required.' }, { status: 400 });
    }
    const emailHash = keccak256(toHex(email.toLowerCase()));
    const mockDerivedAddress = '0x' + emailHash.substring(26, 66);
    return NextResponse.json({ 
      email, 
      emailHash,
      address: mockDerivedAddress,
      isRegistered: email.includes('@pulsepay.com') || email.includes('vitalik')
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Recipient resolution failed.' }, { status: 500 });
  }
}
