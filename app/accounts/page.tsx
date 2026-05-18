'use client'

import { useAuth } from '@/hooks/useAuth'
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

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function AccountsPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: accounts = [], isLoading } = useSWR(user ? '/api/accounts' : null, fetcher)

  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'USD',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccount.name,
          type: newAccount.type,
          balance: newAccount.balance ? parseFloat(newAccount.balance) : 0,
          currency: newAccount.currency,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate('/api/accounts')
      setNewAccount({ name: '', type: 'checking', balance: '', currency: 'USD' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add account')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    setDeleting(accountId)
    try {
      const res = await fetch(`/api/accounts?id=${accountId}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate('/api/accounts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Accounts</h1>
            <p className="text-muted-foreground">Manage your financial accounts</p>
          </div>

          {/* Add Account Form */}
          <Card className="p-6 mb-8 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add New Account</h2>

            <form onSubmit={handleAddAccount} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Account Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Checking Account"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    disabled={loading}
                    required
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">
                    Account Type
                  </Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}
                  >
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance" className="text-foreground">
                    Initial Balance
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    disabled={loading}
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-foreground">
                    Currency
                  </Label>
                  <Select
                    value={newAccount.currency}
                    onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}
                  >
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !newAccount.name}
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
                    Add Account
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Accounts List */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Your Accounts</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account: Account) => (
                  <Card key={account.id} className="p-6 border-border/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground capitalize mb-1">
                          {account.type}
                        </p>
                        <h3 className="text-lg font-semibold text-foreground">{account.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        disabled={deleting === account.id}
                        className="text-destructive hover:text-destructive/80 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-border/50">
                <p className="text-muted-foreground">No accounts yet. Create your first account above!</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
