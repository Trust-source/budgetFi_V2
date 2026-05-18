'use client'

import { useState, useEffect } from 'react'
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
import { formatCurrency } from '@/lib/utils'
import { mutate } from 'swr'

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [preferredCurrency, setPreferredCurrency] = useState('NGN')

  useEffect(() => {
    if (profile?.preferred_currency) {
      setPreferredCurrency(profile.preferred_currency)
    }
  }, [profile])
  const handleUpdateCurrency = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_currency: preferredCurrency }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      mutate('/api/profile')
      setSuccess('Currency preference updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update currency')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Password updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPasswordLoading(false)
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
        <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Account Info */}
          <Card className="p-6 mb-6 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-foreground font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Account ID</Label>
                <p className="text-foreground text-sm font-mono">{user?.id}</p>
              </div>
            </div>
          </Card>

          {/* Currency Preference */}
          <Card className="p-6 mb-6 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Currency Preference</h2>
            <form onSubmit={handleUpdateCurrency} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-foreground">
                  Preferred Currency
                </Label>
                <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                  <SelectTrigger className="bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar ({formatCurrency(1000, 'USD')})</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira ({formatCurrency(1000, 'NGN')})</SelectItem>
                    <SelectItem value="EUR">EUR - Euro ({formatCurrency(1000, 'EUR')})</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound ({formatCurrency(1000, 'GBP')})</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar ({formatCurrency(1000, 'CAD')})</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This currency will be used for dashboard totals, budgets, and reports.
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Currency'
                )}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold text-foreground mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                  className="bg-input border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  required
                  className="bg-input border-border/50"
                />
              </div>
              <Button
                type="submit"
                disabled={passwordLoading || !newPassword || !confirmPassword}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {passwordLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
