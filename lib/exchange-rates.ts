export const BASE_CURRENCY = 'NGN'

const RATE_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

type RateCache = {
  /** NGN per 1 unit of the currency code (e.g. rates.USD = 1327) */
  rates: Record<string, number>
  date: string
  provider: string
  fetchedAt: number
}

let rateCache: RateCache | null = null

/**
 * Frankfurter (ECB) does not publish NGN pairs, so this uses ExchangeRate-API
 * free tier (open.er-api.com), which includes NGN. Fallback: fawazahmed0 CDN.
 *
 * Rates are normalized to NGN per 1 unit of currency.
 */
async function fetchRatesFromProvider(
  url: string,
  parse: (json: any) => { rates: Record<string, number>; date: string; provider: string } | null,
): Promise<RateCache | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    const parsed = parse(json)
    if (!parsed?.rates || typeof parsed.rates.NGN !== 'number' || parsed.rates.NGN <= 0) {
      return null
    }
    return { ...parsed, fetchedAt: Date.now() }
  } catch {
    return null
  }
}

function toNgnPerUnit(usdBasedRates: Record<string, number>): Record<string, number> {
  const usdToNgn = usdBasedRates.USD && usdBasedRates.USD !== 1
    ? usdBasedRates.NGN / usdBasedRates.USD
    : usdBasedRates.NGN

  const result: Record<string, number> = { NGN: 1 }

  for (const [code, rate] of Object.entries(usdBasedRates)) {
    if (!Number.isFinite(rate) || rate <= 0) continue
    // rate is units of currency per 1 USD → NGN per 1 unit of currency
    result[code.toUpperCase()] = usdToNgn / rate
  }

  result.USD = usdToNgn
  result.NGN = 1
  return result
}

export async function getRatesToNgn(forceRefresh = false): Promise<RateCache> {
  if (!forceRefresh && rateCache && Date.now() - rateCache.fetchedAt < RATE_CACHE_TTL_MS) {
    return rateCache
  }

  const primary = await fetchRatesFromProvider('https://open.er-api.com/v6/latest/USD', (json) => {
    if (!json?.rates?.NGN) return null
    return {
      rates: toNgnPerUnit(json.rates),
      date: json.time_last_update_utc || json.date || new Date().toISOString(),
      provider: 'exchangerate-api',
    }
  })

  if (primary?.rates?.NGN === 1 && typeof primary.rates.USD === 'number' && primary.rates.USD > 1) {
    rateCache = primary
    return rateCache
  }

  const fallback = await fetchRatesFromProvider(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    (json) => {
      const usd = json?.usd
      if (!usd?.ngn) return null
      return {
        rates: toNgnPerUnit({
          USD: 1,
          NGN: Number(usd.ngn),
          EUR: Number(usd.eur),
          GBP: Number(usd.gbp),
          CAD: Number(usd.cad),
        }),
        date: json.date || new Date().toISOString(),
        provider: 'fawazahmed0-currency-api',
      }
    },
  )

  if (fallback?.rates?.NGN === 1 && typeof fallback.rates.USD === 'number' && fallback.rates.USD > 1) {
    rateCache = fallback
    return rateCache
  }

  if (rateCache && rateCache.rates.USD > 1) {
    return rateCache
  }

  throw new Error('Unable to fetch exchange rates')
}

export function convertToNgn(
  amount: number,
  currency: string,
  rates: Record<string, number>,
): number {
  const code = (currency || 'USD').toUpperCase()
  if (code === BASE_CURRENCY) return amount

  const rate = rates[code]
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`No exchange rate available for ${code}`)
  }

  return amount * rate
}

export function tryConvertToNgn(
  amount: number,
  currency: string,
  rates: Record<string, number>,
): { amountNgn: number; rate: number | null; converted: boolean } {
  const code = (currency || 'USD').toUpperCase()
  if (code === BASE_CURRENCY) {
    return { amountNgn: amount, rate: 1, converted: true }
  }

  const rate = rates[code]
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    return { amountNgn: amount, rate: null, converted: false }
  }

  return { amountNgn: amount * rate, rate, converted: true }
}
