import { NextRequest, NextResponse } from 'next/server'
import { getUniversalBalance } from '@/lib/particle'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }

  try {
    const balance = await getUniversalBalance(address)
    return NextResponse.json(balance)
  } catch (err) {
    console.error('[balance]', err)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
