
'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Mail, Clock, ArrowRight, Scissors, Users, MessageCircle } from "lucide-react"

export default function LandingPage() {
  const services = [
    { name: 'Corte de Cabelo', description: 'Estilo personalizado com as últimas tendências de moda', imageUrl: 'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png' },
    { name: 'Barba Completa', description: 'Modelagem e design completo para realçar sua masculinidade', imageUrl: 'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png' },
    { name: 'Hidratação', description: 'Tratamento profundo para cabelo e barba mais saudáveis', imageUrl: 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png' },
    { name: 'Pezinho', description: 'Acabamento perfeito para um visual mais refinado e limpo', imageUrl: 'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png' },
    { name: 'Sobrancelha', description: 'Modelagem precisa para expressar melhor seu visual', imageUrl: 'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png' },
    { name: 'Massagem', description: 'Relaxamento completo e revitalizante para seu bem-estar', imageUrl: 'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png' },
  ]

  const professionals = [
    { name: 'Vitor', position: 'Master Barber', imageUrl: 'https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png' },
    { name: 'Carlos', position: 'Especialista em Barba', imageUrl: 'https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png' },
    { name: 'Anderson', position: 'Expert em Cortes', imageUrl: 'https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png' },
    { name: 'Felipe', position: 'Especialista em Design', imageUrl: 'https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png' },
    { name: 'Bruno', position: 'Profissional Sênior', imageUrl: 'https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png' },
  ]

  const testimonials = [
    { name: 'João Silva', rating: 5, text: 'Excelente atendimento! Voltarei com certeza.' },
    { name: 'Pedro Costa', rating: 5, text: 'Profissionais muito atenciosos e qualificados.' },
    { name: 'Lucas Oliveira', rating: 5, text: 'Melhor barbearia da região, ambiente muito bom!' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* Glassmorphism Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-6000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-3000"></div>
      </div>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-linear-to-b from-white/40 to-white/20 backdrop-blur-3xl z-50 border-b-2 border-white/50 shadow-2xl" style={{
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-gray-900" />
              <span className="font-bold text-xl text-gray-900">BarberStyle</span>
            </div>
            <div className="hidden md:flex gap-6">
              <a href="#servicos" className="text-gray-600 hover:text-gray-900 transition">Serviços</a>
              <a href="#profissionais" className="text-gray-600 hover:text-gray-900 transition">Profissionais</a>
              <a href="#avaliacoes" className="text-gray-600 hover:text-gray-900 transition">Avaliações</a>
              <a href="#contato" className="text-gray-600 hover:text-gray-900 transition">Contato</a>
            </div>
            <Link href="/chat">
              <Button size="lg" className="bg-linear-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg backdrop-blur-md transition-all duration-300 rounded-3xl border-none" style={{
                boxShadow: '8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}>
                Agendar Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              A Melhor <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Barbearia</span> da Região
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Profissionais experientes, ambiente acolhedor e serviços de qualidade superior. Agende seu atendimento agora mesmo!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" className="w-full sm:w-auto bg-linear-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base lg:text-lg px-6 sm:px-8 rounded-3xl border-none transition-all duration-300" style={{
                  boxShadow: '8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}>
                  Agendar Agora <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
              </Link>
              <a href="#servicos">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10 text-base lg:text-lg px-6 sm:px-8">
                  Conheça Nossos Serviços
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16"
          >
            {[
              { number: '500+', label: 'Clientes Satisfeitos' },
              { number: '5 Anos', label: 'No Mercado' },
              { number: '5⭐', label: 'Avaliação Média' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-linear-to-br from-white/30 to-white/10 backdrop-blur-3xl rounded-3xl p-4 sm:p-6 text-center border-none hover:bg-linear-to-br hover:from-white/40 hover:to-white/20 transition-all duration-300 group"
                style={{
                  boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.8), inset 0 0 0 rgba(255,255,255,0.3)'
                }}
              >
                <div className="text-2xl sm:text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-gray-300 text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Nossos Serviços</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Oferecemos uma completa variedade de serviços para você</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-linear-to-br from-white/50 to-white/20 backdrop-blur-2xl rounded-3xl overflow-hidden border-none hover:bg-linear-to-br hover:from-white/60 hover:to-white/30 transition-all duration-300 group flex flex-col"
                style={{
                  boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.7), inset -2px -2px 6px rgba(255,255,255,0.4), inset 2px 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div className="w-full h-40 sm:h-48 overflow-hidden bg-gray-100 relative">
                  <Image 
                    src={service.imageUrl} 
                    alt={service.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Profissionais */}
      <section id="profissionais" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Nossos Profissionais</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Conheça a equipe experiente que vai cuidar de você</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            {professionals.map((prof, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-linear-to-br from-white/50 to-white/20 backdrop-blur-2xl rounded-3xl overflow-hidden border-none hover:from-white/60 hover:to-white/30 transition-all duration-300 group flex flex-col"
                style={{
                  boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.7), inset -2px -2px 6px rgba(255,255,255,0.4), inset 2px 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div className="w-full h-40 sm:h-48 md:h-56 overflow-hidden bg-gray-100 relative">
                  <Image 
                    src={prof.imageUrl} 
                    alt={prof.name}
                    width={400}
                    height={224}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{prof.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{prof.position}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Por que nos escolher */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-600 to-purple-600 text-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Por que nos escolher?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100">Qualidade, profissionalismo e satisfação garantidos</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { icon: Users, title: 'Profissionais Experientes', desc: 'Equipe altamente qualificada' },
              { icon: Clock, title: 'Horários Flexíveis', desc: 'Atendimento de terça a domingo' },
              { icon: MapPin, title: 'Localização Estratégica', desc: 'Fácil acesso e estacionamento' },
              { icon: MessageCircle, title: 'Atendimento Personalizado', desc: 'Escutamos suas necessidades' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-linear-to-br from-white/40 to-white/10 backdrop-blur-3xl rounded-3xl p-4 sm:p-6 border-none text-center hover:bg-linear-to-br hover:from-white/50 hover:to-white/20 transition-all duration-300 group"
                style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.12), -10px -10px 20px rgba(255,255,255,0.6), inset -1px -1px 4px rgba(255,255,255,0.3), inset 1px 1px 4px rgba(0,0,0,0.04)'
                }}
              >
                <item.icon className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-base sm:text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-blue-100 text-xs sm:text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Avaliações */}
      <section id="avaliacoes" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">O que nossos clientes dizem</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Mais de 500 clientes satisfeitos</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-linear-to-br from-white/50 to-white/20 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 border-none hover:from-white/60 hover:to-white/30 transition-all duration-300 group"
                style={{
                  boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.7), inset -2px -2px 6px rgba(255,255,255,0.4), inset 2px 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-3 sm:mb-4 italic text-sm sm:text-base">&quot;{testimonial.text}&quot;</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">— {testimonial.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-900 to-gray-800 text-white relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Pronto para um novo visual?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8">
              Agende seu horário agora mesmo e aproveite nossos excelentes serviços
            </p>
            <Link href="/chat">
              <Button size="lg" className="w-full sm:w-auto bg-linear-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg px-6 sm:px-8 rounded-3xl transition-all duration-300 border-none" style={{
                boxShadow: '8px 8px 16px rgba(0,0,0,0.15), -8px -8px 16px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}>
                Agendar Agora <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gray-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand */}
            <div>
              <div className="mb-3 sm:mb-4">
                <span className="font-bold text-lg sm:text-xl">BarberStyle</span>
              </div>
              <p className="text-gray-400 text-sm">A melhor barbearia da região com profissionais experientes.</p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Links</h3>
              <ul className="space-y-2 text-orange-20 text-sm">
                <li><a href="#servicos" className="hover:text-white transition">Serviços</a></li>
                <li><a href="#profissionais" className="hover:text-white transition">Profissionais</a></li>
                <li><a href="#avaliacoes" className="hover:text-white transition">Avaliações</a></li>
                <li><Link href="/chat" className="hover:text-white transition">Agendar</Link></li>
              </ul>
            </div>

            {/* Horário */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" /> Horário
              </h3>
              <ul className="space-y-1 sm:space-y-2 text-orange-20 text-xs sm:text-sm">
                <li>Terça - Sexta: 08:00 - 19:00</li>
                <li>Sábado: 08:00 - 18:00</li>
                <li>Domingo: 09:00 - 17:00</li>
                <li>Segunda: Fechado</li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Contato</h3>
              <ul className="space-y-2 sm:space-y-3 text-orange-20 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 shrink-0" /> <span>(11) 98765-4321</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 shrink-0" /> <span>contato@barberstyle.com.br</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400 shrink-0" /> <span>Rua Principal, 123</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-gray-400 text-xs sm:text-sm">
              <p>&copy; 2025 BarberStyle. Todos os direitos reservados.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">Privacidade</a>
                <a href="#" className="hover:text-white transition">Termos</a>
                <a href="#" className="hover:text-white transition">Política</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
