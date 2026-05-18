'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'

interface Transaction {
  id: string
  category_id: string
  amount: number
  type: 'income' | 'expense'
  transaction_date: string
}

interface Category {
  id: string
  name: string
}

const COLORS = [
  'hsl(var(--color-chart-1))',
  'hsl(var(--color-chart-2))',
  'hsl(var(--color-chart-3))',
  'hsl(var(--color-chart-4))',
  'hsl(var(--color-chart-5))',
]

interface SpendingChartProps {
  transactions: Transaction[]
  categories: Category[]
  month?: number
  year?: number
  currency?: string
}

export function SpendingChart({
  transactions,
  categories,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  currency: propCurrency,
}: SpendingChartProps) {
  const { currency: contextCurrency } = useCurrency()
  const currency = propCurrency || contextCurrency
  const data = useMemo(() => {
    const categorySpending: Record<string, number> = {}

    transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.transaction_date).getMonth() + 1 === month &&
          new Date(t.transaction_date).getFullYear() === year,
      )
      .forEach((t) => {
        categorySpending[t.category_id] = (categorySpending[t.category_id] || 0) + t.amount
      })

    return Object.entries(categorySpending)
      .map(([categoryId, amount]) => ({
        name: categories.find((c) => c.id === categoryId)?.name || categoryId,
        value: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories, month, year])

  if (data.length === 0) {
    return (
      <Card className="p-6 border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No expenses recorded for this period</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value, currency)}
            contentStyle={{
              backgroundColor: 'hsl(var(--color-card))',
              border: '1px solid hsl(var(--color-border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Breakdown */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(item.value, currency)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
