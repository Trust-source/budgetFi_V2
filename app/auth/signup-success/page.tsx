'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center shadow-lg border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Account Created!</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a verification link to your email. Please check your inbox and click the link to verify your email address.
          </p>

          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground font-medium">Check your email</span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Once verified, you can sign in and start managing your finances with BudgetFi.
          </p>

          <Link href="/auth/login" className="w-full block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Sign In
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground mt-4">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <Link href="/auth/signup" className="text-primary hover:text-primary/80">
              try again
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
