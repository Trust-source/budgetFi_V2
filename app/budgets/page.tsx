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
import { Trash2, Plus, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'

interface Budget {
  id: string
  category_id: string
  amount: number
  month: number
  year: number
  created_at: string
}

interface Category {
  id: string
  name: string
}

interface Transaction {
  id: string
  category_id: string
  amount: number
  type: 'income' | 'expense'
  transaction_date: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function BudgetsPage() {
  const { user, loading: authLoading } = useAuth()
  const { currency } = useCurrency()
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { data: budgets = [], isLoading: budgetsLoading } = useSWR(
    user ? `/api/budgets?month=${currentMonth}&year=${currentYear}` : null,
    fetcher,
  )
  const { data: categories = [] } = useSWR(user ? '/api/categories' : null, fetcher)
  const { data: transactions = [] } = useSWR(user ? '/api/transactions' : null, fetcher)

  const [newBudget, setNewBudget] = useState({
    category_id: '',
    amount: '',
    month: currentMonth,
    year: currentYear,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: newBudget.category_id,
          amount: parseFloat(newBudget.amount),
          month: newBudget.month,
          year: newBudget.year,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate(`/api/budgets?month=${newBudget.month}&year=${newBudget.year}`)
      setNewBudget({
        category_id: '',
        amount: '',
        month: currentMonth,
        year: currentYear,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    setDeleting(budgetId)
    try {
      const res = await fetch(`/api/budgets?id=${budgetId}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate(`/api/budgets?month=${currentMonth}&year=${currentYear}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget')
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryName = (id: string) => categories.find((c: Category) => c.id === id)?.name || id

  const getCategorySpent = (categoryId: string) => {
    return transactions
      .filter(
        (t: Transaction) =>
          t.category_id === categoryId &&
          t.type === 'expense' &&
          new Date(t.transaction_date).getMonth() + 1 === currentMonth &&
          new Date(t.transaction_date).getFullYear() === currentYear,
      )
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  }

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Budgets</h1>
            <p className="text-muted-foreground">
              Set and track budgets for {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Add Budget Form */}
          <Card className="p-6 mb-8 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add Budget</h2>

            <form onSubmit={handleAddBudget} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">
                    Category
                  </Label>
                  <Select
                    value={newBudget.category_id}
                    onValueChange={(value) => setNewBudget({ ...newBudget, category_id: value })}
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
                  <Label htmlFor="amount" className="text-foreground">
                    Budget Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    disabled={loading}
                    required
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading || !newBudget.category_id || !newBudget.amount}
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
                        Add Budget
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Budgets List */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Monthly Budgets</h2>
            {budgetsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((budget: Budget) => {
                  const spent = getCategorySpent(budget.category_id)
                  const percentage = Math.min((spent / budget.amount) * 100, 100)
                  const isOverBudget = spent > budget.amount

                  return (
                    <Card key={budget.id} className="p-6 border-border/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {getCategoryName(budget.category_id)}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          disabled={deleting === budget.id}
                          className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-muted-foreground">Spent</p>
                            <p className={`text-sm font-semibold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                              {formatCurrency(spent, currency)} / {formatCurrency(budget.amount, currency)}
                            </p>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isOverBudget ? 'bg-destructive' : 'bg-primary'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        {isOverBudget && (
                          <p className="text-sm text-destructive">
                            Over budget by {formatCurrency(spent - budget.amount, currency)}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(0)}% of budget used
                        </p>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-8 text-center border-border/50">
                <p className="text-muted-foreground">No budgets set yet. Create your first budget above!</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
