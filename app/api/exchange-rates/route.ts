import { NextRequest, NextResponse } from 'next/server'
import { getRatesToNgn, BASE_CURRENCY } from '@/lib/exchange-rates'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('refresh') === '1'
    const payload = await getRatesToNgn(force)

    return NextResponse.json({
      base: BASE_CURRENCY,
      date: payload.date,
      provider: payload.provider,
      rates: payload.rates,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load exchange rates'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
