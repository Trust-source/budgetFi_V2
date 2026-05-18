import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Education', icon: '📚' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Salary', icon: '💼' },
  { name: 'Freelance', icon: '💻' },
  { name: 'Investment', icon: '📈' },
  { name: 'Other', icon: '📌' },
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if categories already exist for this user
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json({ message: 'Categories already seeded' })
    }

    // Insert default categories
    const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
      user_id: user.id,
      name: cat.name,
      icon: cat.icon,
      is_default: false,
    }))

    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Categories seeded successfully',
      count: data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
