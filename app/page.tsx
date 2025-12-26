'use client'

import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import QuickSearch from "@/components/fullstack/quick-search"
import BookingItem from "@/components/booking-item"
import { getPopularBarbershops } from "@/data/barbershops"
import { getUserBookings } from "@/data/bookings"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Users, BarChart3, Smartphone, Mail, ArrowRight, Download, CheckCircle, Star, Globe, Chrome, Bot } from "lucide-react"
import Snowfall from 'react-snowfall'

/**
 * Home Page - Server Component
 * Exibe agendamentos confirmados (se usuário logado) e barbearias populares
 */
export default function Home() {
  // TODO: Fetch dados em paralelo quando temos uma solução de server components
  const barbershops: any[] = []
  const confirmedBookings: any[] = []

  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Inteligente',
      description: 'Sistema completo de agendamentos com calendário visual e notificações automáticas'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastro completo de clientes com histórico de atendimentos e preferências'
    },
    {
      icon: Chrome,
      title: 'Extensão Chrome',
      description: 'Extensão exclusiva para gerenciar catálogos e agendamentos direto do navegador'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Avançados',
      description: 'Dashboards com métricas de desempenho, receitas e análises detalhadas'
    },
    {
      icon: Smartphone,
      title: 'Acesso Mobile',
      description: 'Interface responsiva que funciona perfeitamente em qualquer dispositivo'
    },
    {
      icon: Bot,
      title: 'Agendamento com IA',
      description: 'Sistema inteligente que realiza agendamentos para seus clientes automaticamente'
    }
  ]

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Proprietária - Salão Beleza & Estilo',
      content: 'Revolucionou meu negócio! Agora consigo gerenciar todos os agendamentos sem stress.',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Dentista - Clínica OdontoCare',
      content: 'A automação de confirmações reduziu 80% das faltas. Recomendo para todos!',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Fisioterapeuta',
      content: 'Interface intuitiva e relatórios que me ajudam a tomar decisões estratégicas.',
      rating: 5
    }
  ]

  const plans = [
    {
      name: 'Completo',
      price: 300.00,
      features: [
        'Usuários ilimitados', 
        'Agendamentos ilimitados', 
        'Relatórios avançados',
        'Confirmação por email',
        'Extensão Chrome gratuita',
        'Sistema de agendamento público',
        'Gestão financeira completa',
        'Suporte prioritário 24/7',
        'API personalizada',
        'Backup automático'
      ],
      popular: true
    }
  ]

  return <LandingPage features={features} testimonials={testimonials} plans={plans} />
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

function LandingPage({ features, testimonials, plans }: any) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 relative">
      <Snowfall />
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Agenda.me
          </motion.div>
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-linear-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Gerencie seus
              </span>
              <br />
              <span className="relative bg-linear-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                agendamentos
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-linear-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
              </span>
              <br />
              <span className="bg-linear-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                com inteligência
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A plataforma completa que automatiza seus agendamentos, organiza seus clientes 
              e impulsiona seu negócio com relatórios inteligentes e confirmações automáticas.
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative mx-auto max-w-6xl">
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <Card className="relative bg-white shadow-2xl border-0">
                <CardContent className="p-0">
                  {/* Browser Header */}
                  <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="ml-4 bg-white rounded px-3 py-1 text-sm text-gray-600 flex-1">
                      agenda.me/private/agenda
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-6 bg-linear-to-br from-slate-50 to-blue-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Novo Agendamento
                      </Button>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Hoje</p>
                            <p className="text-2xl font-bold text-blue-600">12</p>
                          </div>
                          <Calendar className="w-8 h-8 text-blue-500" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Clientes</p>
                            <p className="text-2xl font-bold text-green-600">248</p>
                          </div>
                          <Users className="w-8 h-8 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Receita</p>
                            <p className="text-2xl font-bold text-purple-600">R$ 8.5k</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-purple-500" />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Emails</p>
                            <p className="text-2xl font-bold text-orange-600">156</p>
                          </div>
                          <Mail className="w-8 h-8 text-orange-500" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Calendar Preview */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold mb-4">Calendário Semanal</h3>
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
                          <div key={i} className="font-medium text-gray-600 p-2">{day}</div>
                        ))}
                        {Array.from({ length: 7 }, (_, i) => (
                          <div key={i} className="p-2 h-20 border border-gray-100 rounded">
                            <div className="text-xs text-gray-500 mb-1">{i + 15}</div>
                            {i === 2 && <div className="bg-blue-100 text-blue-700 text-xs p-1 rounded mb-1">10:00</div>}
                            {i === 4 && <div className="bg-green-100 text-green-700 text-xs p-1 rounded mb-1">14:30</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mobile Preview */}
          <motion.div 
            className="mt-20 flex justify-center"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 items-center lg:-gap-8">
              {/* Text Section */}
              <div className="text-center lg:text-left pr-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Acesse de qualquer lugar</h3>
                <p className="text-gray-600 max-w-md mx-auto lg:mx-0">
                  Interface responsiva que funciona perfeitamente em dispositivos móveis
                </p>
              </div>
              
              {/* Mockup SVG */}
              <div className="flex justify-center lg:justify-start">
                <img 
                  src="/mockup-iphone.svg" 
                  alt="Mockup da aplicação" 
                  className="w-72 lg:w-80 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Recursos que fazem a diferença</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para transformar seu negócio em uma máquina de eficiência
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature: any, index: number) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <motion.div
                      className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      whileHover={{ rotateY: 180 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Chrome Extension Section */}
      <section className="py-20 px-4 bg-linear-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
              🔥 Exclusivo
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Extensão Chrome Gratuita</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gerencie seus catálogos e agendamentos sem sair do navegador
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Catálogos Inteligentes</h3>
                    <p className="text-gray-600">Crie e gerencie catálogos de produtos/serviços com sincronização automática</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Visualização de Agendamentos</h3>
                    <p className="text-gray-600">Veja todos os compromissos do dia diretamente na extensão</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Acesso Rápido</h3>
                    <p className="text-gray-600">Um clique para acessar todas as funcionalidades principais</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Chrome className="mr-2 w-4 h-4" />
                  Instalar Extensão
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 w-4 h-4" />
                  Download Manual
                </Button>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-purple-400 to-pink-400 rounded-2xl blur-2xl opacity-20"
                  animate={{ 
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <Card className="relative bg-white shadow-2xl">
                  <CardContent className="p-6">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="ml-4 text-xs text-gray-500">Extensão Agenda.me</div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Agendamentos Hoje</span>
                          </div>
                          <div className="text-xs text-gray-600">3 compromissos agendados</div>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">Catálogos</span>
                          </div>
                          <div className="text-xs text-gray-600">2 catálogos sincronizados</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-purple-100 text-purple-700">Gratuita para todos os planos</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-linear-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-xl text-gray-600">Mais de 1.000 empresas já transformaram seus negócios</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial: any, index: number) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Planos para todos os tamanhos</h2>
            <p className="text-xl text-gray-600">Escolha o plano ideal para seu negócio</p>
          </motion.div>

          <motion.div 
            className="max-w-md mx-auto"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="relative border-blue-500 shadow-2xl">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">Plano Único</Badge>
              </div>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-2">{plans[0].name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      R$ {plans[0].price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 text-lg">/mês</span>
                  </div>
                  <p className="text-gray-600">Tudo que você precisa em um só plano</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 mb-8 text-left">
                  {plans[0].features.map((feature: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/auth/register">
                  <Button className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6">
                    Começar Agora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                
                <p className="text-xs text-gray-500 mt-4">
                  Sem taxas de setup • Cancele quando quiser
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-4">Pronto para transformar seu negócio?</h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a milhares de empresas que já automatizaram seus agendamentos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="text-2xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Agenda.me
          </div>
          <p className="text-gray-400 mb-4">
            A plataforma completa para gestão de agendamentos
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Termos de Uso</a>
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  )
}