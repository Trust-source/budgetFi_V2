import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BASE_CURRENCY, getRatesToNgn, tryConvertToNgn } from '@/lib/exchange-rates'

export const dynamic = 'force-dynamic'

type AccountRow = {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at?: string
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const accounts: AccountRow[] = data ?? []
    const ratesPayload = await getRatesToNgn()
    const rates = ratesPayload.rates

    let totalBalanceNgn = 0
    let allConverted = true

    const enrichedAccounts = accounts.map((account) => {
      const balance = Number(account.balance) || 0
      const { amountNgn, rate, converted } = tryConvertToNgn(balance, account.currency, rates)

      if (!converted) allConverted = false
      totalBalanceNgn += amountNgn

      return {
        ...account,
        balance,
        balanceNgn: amountNgn,
        rateToNgn: rate,
        convertedToNgn: converted,
      }
    })

    return NextResponse.json({
      baseCurrency: BASE_CURRENCY,
      totalBalanceNgn,
      accounts: enrichedAccounts,
      rates,
      rateDate: ratesPayload.date,
      rateProvider: ratesPayload.provider,
      allConverted,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
