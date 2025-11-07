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

  const { error } = await (await supabase).auth.signInWithPassword({ email, password })

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    message: 'Login realizado com sucesso!',
  }
}
