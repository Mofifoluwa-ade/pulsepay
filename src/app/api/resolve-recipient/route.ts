import { NextRequest, NextResponse } from 'next/server'

// Resolves an email → wallet address.
// In production: queries FlowPayRegistry.sol on Arbitrum,
// or creates a pending wallet via Magic if recipient hasn't signed up.

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // TODO: query FlowPayRegistry.sol
    // const emailHash = keccak256(toUtf8Bytes(email.toLowerCase()))
    // const address = await registry.resolve(emailHash)

    // Mock: return a deterministic address for demo
    const mockAddress = `0x${Buffer.from(email).toString('hex').slice(0, 40).padEnd(40, '0')}`

    return NextResponse.json({
      email,
      address: mockAddress,
      registered: true,   // false = pending wallet, funds held in registry
    })
  } catch (err) {
    console.error('[resolve-recipient]', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
