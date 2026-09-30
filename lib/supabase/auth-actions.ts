'use server'

import { createClient } from '@/lib/supabase/server'

export type AuthActionResult = {
  error: string | null
  success: boolean
}

function firstError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return 'An unexpected error occurred'
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are required', success: false }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message, success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    return { error: firstError(err), success: false }
  }
}

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const origin = String(formData.get('origin') ?? '').trim()

  if (!email || !password) {
    return { error: 'Email and password are required', success: false }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters', success: false }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message, success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    return { error: firstError(err), success: false }
  }
}

export async function resetPasswordEmailAction(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim()
  const origin = String(formData.get('origin') ?? '').trim()

  if (!email) {
    return { error: 'Email is required', success: false }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message, success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    return { error: firstError(err), success: false }
  }
}

export async function updatePasswordAction(formData: FormData): Promise<AuthActionResult> {
  const password = String(formData.get('password') ?? '')

  if (!password) {
    return { error: 'Password is required', success: false }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters', success: false }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return { error: error.message, success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    return { error: firstError(err), success: false }
  }
}

export async function logoutAction(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message, success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    return { error: firstError(err), success: false }
  }
}
