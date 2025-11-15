'use server'

import { createClient } from '@/utils/supabase/server'

export type LoginState = {
  success: boolean | null
  message?: string
}

export async function login(
  previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = (formData.get('name') as string) || ''

  const { data, error } = await (await supabase).auth.signInWithPassword({ email, password })

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  // if sign-in succeeded and a name was provided, upsert into User table
  try {
    const userId = (data as any)?.user?.id ?? (data as any)?.session?.user?.id
    if (userId && name && name.trim().length > 0) {
      const sup = await supabase
      const { error: upsertError } = await sup.from('User').upsert({ id: userId, name: name.trim() }, { onConflict: 'id' })
      if (upsertError) {
        // log but don't fail login
        // eslint-disable-next-line no-console
        console.error('Failed to upsert user name after login:', upsertError)
      }
    }
  } catch (e) {
    // ignore errors during optional profile upsert
  }

  return {
    success: true,
    message: 'Login realizado com sucesso!',
  }
}
