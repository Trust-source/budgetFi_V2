'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logoutAction } from '@/lib/supabase/auth-actions'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  preferred_currency: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        setProfile({ id: userId, email, preferred_currency: 'USD' })
      }
    } catch {
      setProfile({ id: userId, email, preferred_currency: 'USD' })
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          setError(error.message)
          router.push('/auth/login')
          return
        }

        setUser(user)
        if (user) {
          await fetchProfile(user.id, user.email || '')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '')
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const logout = async () => {
    try {
      const result = await logoutAction()
      if (result.error) {
        setError(result.error)
        return
      }
      setUser(null)
      setProfile(null)
      router.push('/auth/login')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return { user, profile, loading, error, logout }
}
