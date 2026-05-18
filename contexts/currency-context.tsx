'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { DEFAULT_CURRENCY, type SupportedCurrency, isValidCurrency } from '@/lib/currency'
import { useAuth } from '@/hooks/useAuth'

interface CurrencyContextType {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.preferred_currency) {
      const val = profile.preferred_currency
      if (isValidCurrency(val)) {
        setCurrencyState(val)
      }
    }
    setLoading(false)
  }, [profile])

  const setCurrency = (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
