import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const localeMap: Record<string, string> = {
    USD: 'en-US',
    NGN: 'en-NG',
    EUR: 'de-DE',
    GBP: 'en-GB',
    CAD: 'en-CA',
  }
  const locale = localeMap[currency] || 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
