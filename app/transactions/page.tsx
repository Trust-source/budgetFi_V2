'use client'

import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/contexts/currency-context'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2, Plus, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'

interface Transaction {
  id: string
  account_id: string
  category_id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  transaction_date: string
  created_at: string
}

interface Account {
  id: string
  name: string
  currency: string
}

interface Category {
  id: string
  name: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth()
  const { currency } = useCurrency()
  const { data: transactions = [], isLoading: txLoading } = useSWR(
    user ? '/api/transactions' : null,
    fetcher,
  )
  const { data: accounts = [] } = useSWR(user ? '/api/accounts' : null, fetcher)
  const { data: categories = [] } = useSWR(user ? '/api/categories' : null, fetcher)

  const [newTransaction, setNewTransaction] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    type: 'expense' as const,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: newTransaction.account_id,
          category_id: newTransaction.category_id,
          amount: parseFloat(newTransaction.amount),
          type: newTransaction.type,
          description: newTransaction.description,
          transaction_date: newTransaction.transaction_date,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate('/api/transactions')
      mutate('/api/accounts')
      setNewTransaction({
        account_id: '',
        category_id: '',
        amount: '',
        type: 'expense',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    setDeleting(transactionId)
    try {
      const res = await fetch(`/api/transactions?id=${transactionId}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate('/api/transactions')
      mutate('/api/accounts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    } finally {
      setDeleting(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const getAccountName = (id: string) => accounts.find((a: Account) => a.id === id)?.name || id
  const getCategoryName = (id: string) => categories.find((c: Category) => c.id === id)?.name || id

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="pt-16 md:pt-0 mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
            <p className="text-muted-foreground">Track your income and expenses</p>
          </div>

          {/* Add Transaction Form */}
          <Card className="p-6 mb-8 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add Transaction</h2>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account" className="text-foreground">
                    Account
                  </Label>
                  <Select
                    value={newTransaction.account_id}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, account_id: value })
                    }
                  >
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: Account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">
                    Category
                  </Label>
                  <Select
                    value={newTransaction.category_id}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, category_id: value })
                    }
                  >
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">
                    Type
                  </Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as 'income' | 'expense',
                      })
                    }
                  >
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    disabled={loading}
                    required
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, transaction_date: e.target.value })
                    }
                    disabled={loading}
                    required
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., Grocery shopping"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, description: e.target.value })
                    }
                    disabled={loading}
                    className="bg-input border-border/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  loading ||
                  !newTransaction.account_id ||
                  !newTransaction.category_id ||
                  !newTransaction.amount
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Transactions List */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Transaction History</h2>
            {txLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : transactions.length > 0 ? (
              <Card className="border-border/50 overflow-hidden">
                <div className="divide-y divide-border">
                  {transactions.map((transaction: Transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1 flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'income'
                              ? 'bg-green-500/10'
                              : 'bg-destructive/10'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description || getCategoryName(transaction.category_id)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getAccountName(transaction.account_id)} •{' '}
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-foreground'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, accounts.find((a: Account) => a.id === transaction.account_id)?.currency || currency)}
                        </p>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          disabled={deleting === transaction.id}
                          className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center border-border/50">
                <p className="text-muted-foreground">No transactions yet. Add your first transaction above!</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
