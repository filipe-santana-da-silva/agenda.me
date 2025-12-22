'use server'

import { redirect } from 'next/navigation'

export type LoginState = {
  success: boolean | null
  message?: string
}

export async function login(
  previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return {
      success: false,
      message: 'Email e senha são obrigatórios',
    }
  }

  try {
    // Usar nossa API customizada
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        message: error.error || 'Credenciais inválidas',
      }
    }

    const { user } = await response.json()
    
    // Armazenar dados do usuário no localStorage (será usado pelo SimpleAuthContext)
    // Como estamos no server, vamos redirecionar e deixar o client lidar com o storage
    
    return {
      success: true,
      message: 'Login realizado com sucesso!',
    }
  } catch (error) {
    console.error('Erro no login:', error)
    return {
      success: false,
      message: 'Erro interno do servidor',
    }
  }
}
