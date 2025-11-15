'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { useActionState } from 'react'
import { login, LoginState } from '../(auth)/login/actions'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Loader, MessageCircle } from 'lucide-react'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {
      success: null,
      message: '',
    }
  )

  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      // Redirect to private agenda page
      router.push('/private/agenda')
      // Refresh the page after a short delay to ensure all auth state is updated
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }, [state.success])

  return (
    <Card className="w-full max-w-sm shadow-md bg-black">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Login</CardTitle>
        <CardDescription className="text-white">
          Digite seu e-mail e senha para acessar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="grid gap-4">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input className='text-white' id="email" name="email" type="email" required />

            <Label htmlFor="password" className="text-white">Senha</Label>
            <Input className='text-white' id="password" name="password" type="password" required />

            <Label htmlFor="name" className="text-white">Nome (opcional)</Label>
            <Input className='text-white' id="name" name="name" type="text" placeholder="Seu nome completo" />

            {state.success === false && (
              <Alert className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Erro!</AlertTitle>
                <AlertDescription>
                  {state.message || 'Verifique suas credenciais e tente novamente.'}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              {pending && <Loader className="animate-spin mr-2" />}
              Entrar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
