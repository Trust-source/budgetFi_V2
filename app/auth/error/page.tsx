'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center shadow-lg border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">
            Something went wrong during authentication. Please try again or contact support.
          </p>

          <div className="space-y-3">
            <Link href="/auth/login" className="w-full block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Back to Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" className="w-full block">
              <Button variant="outline" className="w-full border-border hover:bg-muted">
                Create Account
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            If you continue to experience issues, please contact our support team.
          </p>
        </Card>
      </div>
    </div>
  )
}
