'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/SimpleAuthContext'
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Loader, MessageCircle, Lock, Mail } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/private/agenda')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
        <p className="text-gray-600">Acesse sua conta de gerenciamento</p>
      </div>

      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl text-gray-900 font-bold">Entrar</CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Faça login para acessar o painel de controle
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-700 font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-50 border-red-200 mt-4">
                <MessageCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900 font-semibold">Erro de autenticação</AlertTitle>
                <AlertDescription className="text-red-700 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base mt-6 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2 w-4 h-4" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            {/* Footer Text */}
            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Primeira vez aqui?{' '}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Solicite acesso
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-gray-700 text-xs leading-relaxed">
          <span className="font-semibold text-blue-900">🔒 Seguro:</span> Seus dados são criptografados e protegidos de acordo com os padrões internacionais de segurança.
        </p>
      </div>
    </div>
  )
}
