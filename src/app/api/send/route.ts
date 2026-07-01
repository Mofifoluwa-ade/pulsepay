import { NextRequest, NextResponse } from 'next/server'
import { sendViaUniversalAccount } from '@/lib/particle'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fromAddress, toAddress, amount } = body

    if (!fromAddress || !toAddress || !amount) {
      return NextResponse.json({ error: 'fromAddress, toAddress, amount required' }, { status: 400 })
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Executes cross-chain transfer via Particle Universal Accounts (EIP-7702)
    // Gas is sponsored via ZeroDev paymaster — user pays nothing
    const result = await sendViaUniversalAccount(fromAddress, toAddress, parseFloat(amount))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[send]', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
