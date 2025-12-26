"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/SimpleAuthContext'

import { Check, Crown,  CreditCard } from "lucide-react"
import { toast } from "sonner"

type Plan = {
  id: string
  name: string
  price: number
  interval: "monthly" | "yearly"
  features: string[]
  maxUsers: number
  maxAppointments: number
  isPopular?: boolean
  stripePriceId: string
}

const plans: Plan[] = [
  {
    id: "complete",
    name: "Completo",
    price: 300.00,
    interval: "monthly",
    maxUsers: -1,
    maxAppointments: -1,
    isPopular: true,
    stripePriceId: "price_complete_monthly",
    features: [
      "Usuários ilimitados",
      "Agendamentos ilimitados",
      "Relatórios avançados",
      "Confirmação por email",
      "Extensão Chrome gratuita",
      "Sistema de agendamento público",
      "Gestão financeira completa",
      "Suporte prioritário 24/7",
      "API personalizada",
      "Backup automático"
    ]
  }
]

export default function PlanosPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [usage] = useState({
    users: 3,
    appointments: 245
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Verificar parâmetros de URL para success/cancel
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success')) {
      toast.success('Pagamento realizado com sucesso!')
      setCurrentPlan('complete')
    }
    if (urlParams.get('canceled')) {
      toast.error('Pagamento cancelado')
    }
    
    // Verificar se já tem plano ativo
    const savedPlan = localStorage.getItem('current_plan')
    if (savedPlan) {
      setCurrentPlan(savedPlan)
    }
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (!user?.id) {
      toast.error('Usuário não encontrado')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan) {
      toast.error('Plano não encontrado')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na API')
      }

      const { url } = await response.json()
      
      // Redirecionar para a URL do checkout do Stripe
      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL do checkout não retornada')
      }
    } catch (error: unknown) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = () => {
    toast.success("Redirecionando para portal de cobrança")
  }
  
  const handleActivatePlan = () => {
    setCurrentPlan('complete')
    localStorage.setItem('current_plan', 'complete')
    toast.success('Plano ativado com sucesso!')
  }
  
  const handleCancelPlan = () => {
    setCurrentPlan(null)
    localStorage.removeItem('current_plan')
    toast.success('Plano cancelado')
  }

  const getCurrentPlanData = () => {
    return plans.find(plan => plan.id === currentPlan)
  }

  const currentPlanData = getCurrentPlanData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planos e Cobrança</h1>
        <p className="text-gray-600">Gerencie seu plano e acompanhe o uso</p>
      </div>

      {currentPlan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentPlanData?.name}</h3>
                <p className="text-gray-600">R$ {currentPlanData?.price.toFixed(2)}/mês</p>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usuários</span>
                  <span>{usage.users}/∞</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Agendamentos este mês</span>
                  <span>{usage.appointments}/∞</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleManageBilling} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Gerenciar Cobrança
              </Button>
              <Button onClick={handleCancelPlan} variant="destructive">
                Cancelar Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Plano Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Você não possui um plano ativo. Escolha um plano abaixo para começar.</p>
            <Button onClick={handleActivatePlan} className="bg-green-600 hover:bg-green-700">
              Ativar Plano Gratuito (Teste)
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Plano Disponível</h2>
        <div className="max-w-md mx-auto">
          <Card className="relative border-blue-500 shadow-xl">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1">Plano Único</Badge>
            </div>
            
            <CardHeader className="text-center pt-8">
              <CardTitle className="flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                {plans[0].name}
              </CardTitle>
              <div className="space-y-1">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  R$ {plans[0].price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">/mês</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {plans[0].features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6" 
                disabled={plans[0].id === currentPlan || loading}
                onClick={() => handleUpgrade(plans[0].id)}
              >
                {loading ? "Processando..." : plans[0].id === currentPlan ? "Plano Atual" : "Assinar Agora"}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Sem taxas de setup • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}