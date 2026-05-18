'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/contexts/currency-context'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import useSWR from 'swr'
import { SpendingChart } from '@/components/spending-chart'

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

interface Transaction {
  id: string
  account_id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  transaction_date: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { currency } = useCurrency()
  const [seeded, setSeeded] = useState(false)

  // Seed categories on first load
  useEffect(() => {
    if (user && !seeded) {
      fetch('/api/seed-categories', { method: 'POST' })
      setSeeded(true)
    }
  }, [user, seeded])

  const { data: accounts = [], isLoading: accountsLoading } = useSWR(
    user ? '/api/accounts' : null,
    fetcher,
  )
  const { data: transactions = [], isLoading: transactionsLoading } = useSWR(
    user ? '/api/transactions?limit=5' : null,
    fetcher,
  )
  const { data: categories = [] } = useSWR(user ? '/api/categories' : null, fetcher)

  const totalBalance = accounts.reduce((sum: number, acc: Account) => sum + (acc.balance || 0), 0)
  const income = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  const expenses = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const loading = authLoading || accountsLoading || transactionsLoading

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="pt-16 md:pt-0 mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Balance */}
            <Card className="p-8 border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-muted-foreground">Total Balance</h3>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-primary" />
                </div>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {formatCurrency(totalBalance, currency)}
              </p>
            </Card>

            {/* Income */}
            <Card className="p-8 border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-muted-foreground">Income</h3>
                <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {formatCurrency(income, currency)}
              </p>
            </Card>

            {/* Expenses */}
            <Card className="p-8 border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-muted-foreground">Expenses</h3>
                <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-7 h-7 text-destructive" />
                </div>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {formatCurrency(expenses, currency)}
              </p>
            </Card>

            {/* Accounts Count */}
            <Card className="p-8 border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-muted-foreground">Accounts</h3>
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-secondary" />
                </div>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {accounts.length}
              </p>
            </Card>
          </div>

          {/* Accounts List */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Accounts</h2>
            {accountsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account: Account) => (
                  <Card key={account.id} className="p-6 border-border/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                        <h3 className="text-lg font-semibold text-foreground">{account.name}</h3>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-border/50">
                <p className="text-muted-foreground">No accounts yet. Create your first account!</p>
              </Card>
            )}
          </div>

          {/* Spending Chart */}
          <div className="mb-8">
            <SpendingChart transactions={transactions} categories={categories} currency={currency} />
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Transactions</h2>
            {transactionsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : transactions.length > 0 ? (
              <Card className="border-border/50 overflow-hidden">
                <div className="divide-y divide-border">
                  {transactions.map((transaction: Transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-foreground'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, accounts.find((a: Account) => a.id === transaction.account_id)?.currency || currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center border-border/50">
                <p className="text-muted-foreground">No transactions yet.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
