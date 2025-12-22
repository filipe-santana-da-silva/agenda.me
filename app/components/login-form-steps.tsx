'use client'

import { useEffect, useState, useTransition } from 'react'
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
// import { login, LoginState } from '../(auth)/login/actions' // Removido - usando fetch direto
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Loader, MessageCircle, Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import VirtualKeyboard from './virtual-keyboard'

export default function LoginFormSteps() {
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setLocalError('Por favor, digite seu email')
      return
    }
    if (!email.includes('@')) {
      setLocalError('Por favor, digite um email válido')
      return
    }
    setLocalError('')
    setServerError('')
    setStep('password')
  }

  const handlePasswordKeyPress = (key: string) => {
    console.log('handlePasswordKeyPress called with:', key)
    setTempPassword((prev) => prev + key)
    setLocalError('')
    setServerError('')
  }

  const handlePasswordBackspace = () => {
    setTempPassword((prev) => prev.slice(0, -1))
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handlePasswordSubmit called', { tempPassword, step })
    
    if (!tempPassword) {
      setLocalError('Por favor, digite sua senha')
      return
    }

    // Atualiza password com tempPassword
    setPassword(tempPassword)
    setLocalError('')
    setServerError('')

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', tempPassword)

      try {
        // Usar diretamente a API de login customizada
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: tempPassword })
        })

        if (!response.ok) {
          const error = await response.json()
          setServerError(error.message || 'Email ou senha inválidos. Tente novamente.')
          return
        }

        const { user } = await response.json()
        
        // Armazenar no localStorage para o SimpleAuthContext
        localStorage.setItem('user', JSON.stringify(user))
        
        // Redirecionar
        setTimeout(() => {
          window.location.assign('/private/agenda')
        }, 250)
      } catch (error) {
        setServerError('Erro ao fazer login. Tente novamente.')
      }
    })
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
        <p className="text-gray-600">
          {step === 'email'
            ? 'Digite seu email para começar'
            : 'Digite sua senha para entrar'}
        </p>
      </div>

      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex items-center gap-3">
            {step === 'password' && (
              <button
                onClick={() => {
                  setStep('email')
                  setLocalError('')
                  setPassword('')
                  setServerError('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <div>
              <CardTitle className="text-3xl text-gray-900 font-bold">
                {step === 'email' ? 'Email' : 'Senha'}
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {step === 'email'
                  ? 'Passo 1 de 2'
                  : `Passo 2 de 2 - ${email}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-10">
          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-gray-700 font-semibold flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  Seu Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setLocalError('')
                  }}
                  autoFocus
                  className="h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                />
              </div>

              {localError && (
                <Alert className="bg-red-50 border-red-200">
                  <MessageCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-900 font-semibold">
                    Atenção
                  </AlertTitle>
                  <AlertDescription className="text-red-700 text-sm">
                    {localError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Próximo
              </Button>

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
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form 
              onSubmit={handlePasswordSubmit} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              className="space-y-6"
            >
              <div className="flex gap-8">
                {/* Password Input */}
                <div className="flex-1 space-y-4">
                  <Label className="text-gray-700 font-semibold text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Sua Senha
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={tempPassword}
                      readOnly
                      className="h-14 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400 cursor-default pr-12"
                    />
                    {tempPassword && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded"
                      >
                        {showPassword ? (
                          <EyeOff className="w-6 h-6" />
                        ) : (
                          <Eye className="w-6 h-6" />
                        )}
                      </button>
                    )}
                  </div>

                  {localError && (
                    <Alert className="bg-red-50 border-red-200">
                      <MessageCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-900 font-semibold">
                        Erro
                      </AlertTitle>
                      <AlertDescription className="text-red-700 text-sm">
                        {localError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {serverError && (
                    <Alert className="bg-red-50 border-red-200">
                      <MessageCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-900 font-semibold">
                        Erro de autenticação
                      </AlertTitle>
                      <AlertDescription className="text-red-700 text-sm">
                        {serverError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    disabled={isPending || !tempPassword}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader className="animate-spin mr-2 w-5 h-5" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </div>

                {/* Virtual Keyboard */}
                <div className="hidden xl:flex flex-col items-center">
                  <VirtualKeyboard
                    onKeyPress={handlePasswordKeyPress}
                    onBackspace={handlePasswordBackspace}
                  />
                </div>
              </div>

              {/* Mobile Keyboard */}
              <div className="xl:hidden">
                <VirtualKeyboard
                  onKeyPress={handlePasswordKeyPress}
                  onBackspace={handlePasswordBackspace}
                />
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-gray-700 text-xs leading-relaxed">
          <span className="font-semibold text-blue-900">🔒 Seguro:</span> Seus dados
          são criptografados e protegidos de acordo com os padrões internacionais de
          segurança.
        </p>
      </div>
    </div>
  )
}
