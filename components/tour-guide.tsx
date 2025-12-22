'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

type TourStep = {
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
  page: string
}

const tourSteps: TourStep[] = [
  // Agenda
  { target: '[data-tour="new-appointment"]', title: 'Novo Agendamento', description: 'Clique aqui para criar um novo compromisso', position: 'bottom', page: '/private/agenda' },
  { target: '[data-tour="week-nav"]', title: 'Navegação', description: 'Use as setas para navegar entre semanas', position: 'bottom', page: '/private/agenda' },
  { target: '[data-tour="calendar-grid"]', title: 'Grade de Horários', description: 'Clique em um horário para criar agendamento rápido', position: 'top', page: '/private/agenda' },
  
  // Sidebar - Menu Principal
  { target: '[data-tour="clientes-link"]', title: 'Clientes', description: 'Cadastre e gerencie seus clientes', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="servicos-link"]', title: 'Serviços', description: 'Configure serviços, duração e preços', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="produtos-link"]', title: 'Produtos', description: 'Gerencie produtos para venda', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="catalogos-link"]', title: 'Catálogos', description: 'Crie catálogos para enviar no WhatsApp', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="financeiro-link"]', title: 'Financeiro', description: 'Controle receitas, despesas e comissões', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="funcionarios-link"]', title: 'Funcionários', description: 'Gerencie sua equipe e profissionais', position: 'right', page: '/private/agenda' },
  
  // Sidebar - Configurações
  { target: '[data-tour="planos-link"]', title: 'Planos', description: 'Gerencie seu plano de assinatura', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="permissoes-link"]', title: 'Permissões', description: 'Configure permissões de usuários', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="suporte-link"]', title: 'Suporte', description: 'Entre em contato com o suporte técnico', position: 'right', page: '/private/agenda' },
  { target: '[data-tour="profile-link"]', title: 'Meu Perfil', description: 'Atualize suas informações pessoais', position: 'right', page: '/private/agenda' },
]

export function TourGuide() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [checkCount, setCheckCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    console.log('TourGuide montado')
  }, [])

  // Verificar flag periodicamente quando montado
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      const startTour = localStorage.getItem('start_tour')
      if (startTour === 'true') {
        console.log('Flag start_tour detectada!')
        localStorage.removeItem('start_tour')
        setIsActive(true)
        setCurrentStep(0)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    
    const tourCompleted = localStorage.getItem('tour_completed')
    const onboardingCompleted = localStorage.getItem('onboarding_completed')
    
    console.log('Tour check inicial:', { tourCompleted, onboardingCompleted })
    
    // Iniciar tour automaticamente apenas se nunca foi completado e onboarding foi feito
    if (!tourCompleted && onboardingCompleted) {
      console.log('Iniciando tour automático em 2 segundos...')
      setTimeout(() => {
        console.log('Ativando tour agora')
        setIsActive(true)
      }, 2000)
    }
  }, [mounted])

  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const step = tourSteps[currentStep]
      const element = document.querySelector(step.target)
      
      if (!element) {
        console.log('Elemento não encontrado:', step.target)
        return
      }

      const rect = element.getBoundingClientRect()
      const cardHeight = 200 // Altura aproximada do card
      const cardWidth = 300 // Largura do card
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      let top = 0, left = 0

      console.log('Posicionando card:', {
        step: step.title,
        position: step.position,
        elementRect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
        viewport: { width: viewportWidth, height: viewportHeight }
      })

      switch (step.position) {
        case 'top':
          top = rect.top - cardHeight - 20
          left = rect.left + rect.width / 2 - cardWidth / 2
          break
        case 'bottom':
          top = rect.bottom + 20
          left = rect.left + rect.width / 2 - cardWidth / 2
          break
        case 'left':
          top = rect.top + rect.height / 2 - cardHeight / 2
          left = rect.left - cardWidth - 20
          break
        case 'right':
          top = rect.top + rect.height / 2 - cardHeight / 2
          left = rect.right + 20
          break
      }

      console.log('Posição calculada (antes ajustes):', { top, left })

      // Ajustar verticalmente para não sair da tela
      if (top + cardHeight > viewportHeight) {
        top = viewportHeight - cardHeight - 20
      }
      if (top < 20) {
        top = 20
      }

      // Verificar se o card sai pela direita
      if (left + cardWidth > viewportWidth) {
        left = viewportWidth - cardWidth - 20
      }
      // Verificar se o card sai pela esquerda
      if (left < 20) {
        left = 20
      }

      console.log('Posição final:', { top, left })

      setPosition({ top, left })
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }

    const timer = setTimeout(updatePosition, 100)
    window.addEventListener('resize', updatePosition)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isActive, currentStep])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setIsActive(false)
    localStorage.setItem('tour_completed', 'true')
  }

  if (!mounted || !isActive) return null

  const step = tourSteps[currentStep]
  const targetElement = document.querySelector(step.target)

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={handleClose} />
      
      {/* Destaque do elemento */}
      {targetElement && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Card flutuante */}
      <Card
        className="fixed z-[10000] w-[300px] shadow-2xl animate-in fade-in slide-in-from-bottom-4"
        style={{ top: position.top, left: position.left }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} de {tourSteps.length}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentStep === 0}>
                <ArrowLeft className="h-3 w-3" />
              </Button>
              <Button size="sm" onClick={handleNext}>
                {currentStep === tourSteps.length - 1 ? 'Concluir' : 'Próximo'}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
