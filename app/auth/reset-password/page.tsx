'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePasswordAction } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const formData = new FormData()
    formData.set('password', password)

    startTransition(async () => {
      const result = await updatePasswordAction(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₿</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">BudgetFi</h1>
          </div>
          <p className="text-muted-foreground">Take control of your finances</p>
        </div>

        <Card className="p-6 md:p-8 shadow-lg border border-border/50">
          <h2 className="text-xl font-semibold text-foreground mb-6">Create new password</h2>

          {success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-600">
                  Password updated successfully! Redirecting...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="bg-input border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  required
                  className="bg-input border-border/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border/30">
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                Back to Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
