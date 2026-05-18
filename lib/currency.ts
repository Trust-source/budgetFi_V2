export const SUPPORTED_CURRENCIES = ['USD', 'NGN', 'EUR', 'GBP', 'CAD'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const DEFAULT_CURRENCY: SupportedCurrency = 'USD'

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  USD: 'USD - US Dollar',
  NGN: 'NGN - Nigerian Naira',
  EUR: 'EUR - Euro',
  GBP: 'GBP - British Pound',
  CAD: 'CAD - Canadian Dollar',
}

export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)
}
