'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, Wallet, TrendingUp, PieChart, DollarSign } from 'lucide-react'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">BudgetFi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-foreground hover:bg-muted">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-20 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Take control of your finances
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            BudgetFi makes it easy to track your accounts, manage budgets, and understand your spending habits. Start your financial journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start free today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
                Sign in to existing account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/30 border-y border-border/20 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-16">
            Everything you need for smart finances
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Account</h3>
              <p className="text-muted-foreground">
                Manage multiple accounts in one place. Track checking, savings, credit cards, and investments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Budgets</h3>
              <p className="text-muted-foreground">
                Set category budgets and track spending. Get alerts when you&apos;re approaching limits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Track Income</h3>
              <p className="text-muted-foreground">
                Log all income sources and monitor your earnings. Get insights on your financial health.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Visualize Spending</h3>
              <p className="text-muted-foreground">
                Beautiful charts and reports show where your money goes. Understand spending patterns.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Easy Transactions</h3>
              <p className="text-muted-foreground">
                Add transactions with just a few clicks. Organize by category and date. Simple and fast.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and secure. We&apos;ll never share your financial information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Ready to master your finances?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users taking control of their money with BudgetFi.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create your account now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-card/30 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-muted-foreground text-sm">
          <p>© 2024 BudgetFi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
