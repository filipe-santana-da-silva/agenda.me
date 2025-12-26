'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import Image from 'next/image'
import { Smartphone, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAvailableTimeSlots } from '@/hooks/use-available-time-slots'

interface Barbershop {
  id: string
  name: string
  address: string
  description: string
  image_url: string
  phones: string[]
  services: BarbershopService[]
}

interface BarbershopService {
  id: string
  name: string
  description: string
  image_url: string
  price_in_cents: number
  barbershop_id: string
}

interface BookingClientProps {
  barbershops: Barbershop[]
}

interface LastBooking {
  barbershop_name: string
  service_name: string
  appointment_date: string
  service_price: number
  [key: string]: unknown
}

export function BookingClient({ barbershops }: BookingClientProps) {
  const [selectedBarbershop, setSelectedBarbershop] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [lastBooking, setLastBooking] = useState<LastBooking | null>(null)
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  
  // Buscar telefone e nome do cliente logado
  React.useEffect(() => {
    const savedUser = localStorage.getItem('bookingUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCustomerPhone(user.phone)
      setCustomerName(user.name || '')
    }
  }, [])
  
  const { availableTimeSlots, loading: loadingTimeSlots } = useAvailableTimeSlots({
    barbershopId: selectedBarbershop,
    date: selectedDate,
  })

  const currentBarbershop = barbershops.find(b => b.id === selectedBarbershop)
  const currentService = currentBarbershop?.services.find(s => s.id === selectedService)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBarbershop || !selectedService || !selectedDate || !selectedTime) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (!customerPhone) {
      toast.error('É necessário estar logado para agendar')
      return
    }

    setSubmitting(true)

    try {
      // Combinar data e hora
      const hours = parseInt(selectedTime.split(':')[0])
      const minutes = parseInt(selectedTime.split(':')[1])
      const bookingDate = new Date(selectedDate)
      bookingDate.setHours(hours, minutes, 0, 0)

      const response = await fetch('/api/public/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barbershop_id: selectedBarbershop,
          service_id: selectedService,
          customer_name: customerName,
          appointment_date: bookingDate.toISOString(),
          customer_phone: customerPhone,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Agendamento realizado com sucesso!')

        setLastBooking({
          ...result.booking,
          barbershop_name: currentBarbershop?.name,
          service_name: currentService?.name,
          service_price: currentService?.price_in_cents,
        })
        setBookingSuccess(true)

        // Reset form
        setSelectedBarbershop('')
        setSelectedService('')
        setSelectedDate('')
        setSelectedTime('')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Erro ao realizar agendamento')
      }
    } catch {
      toast.error('Erro ao realizar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedServiceData = currentService

  return (
    <div className="min-h-screen bg-background">
      {!selectedBarbershop ? (
        // View de Seleção de Barbearia
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Escolha uma Barbearia</h1>
            <p className="text-muted-foreground mb-8">Selecione a barbearia onde você deseja agendar</p>

            <div className="grid grid-cols-1 gap-4">
              {barbershops.map((barbershop) => (
                <Card
                  key={barbershop.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedBarbershop(barbershop.id)}
                >
                  <div className="relative h-37.5 rounded-t-lg overflow-hidden bg-muted">
                    {barbershop.image_url && (
                      <Image
                        src={barbershop.image_url}
                        alt={barbershop.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-1">{barbershop.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{barbershop.address}</p>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <p className="text-sm">{barbershop.phones[0]}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // View de Agendamento
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header com Voltar */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedBarbershop('')
                  setSelectedService('')
                  setSelectedDate('')
                  setSelectedTime('')
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{currentBarbershop?.name}</h1>
                <p className="text-sm text-muted-foreground">{currentBarbershop?.address}</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Novo Agendamento</CardTitle>
                <CardDescription>Selecione o serviço, data e horário</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Serviço */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Serviço *</label>
                    <div className="grid grid-cols-1 gap-3">
                      {currentBarbershop?.services.map((service) => (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all ${
                            selectedService === service.id
                              ? 'ring-2 ring-primary'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedService(service.id)}
                        >
                          <CardContent className="flex gap-4 p-4">
                            <div className="relative w-20 h-20 shrink-0 bg-muted rounded-md">
                              {service.image_url && (
                                <Image
                                  src={service.image_url}
                                  alt={service.name}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                              <p className="text-lg font-bold mt-2">
                                R$ {(service.price_in_cents / 100).toFixed(2)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Data */}
                  {selectedService && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data *</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Horário */}
                  {selectedDate && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Horário *</label>
                      {loadingTimeSlots ? (
                        <div className="text-sm text-muted-foreground">Carregando horários...</div>
                      ) : availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {availableTimeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? 'default' : 'outline'}
                              onClick={() => setSelectedTime(time)}
                              className="text-sm"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Nenhum horário disponível para esta data</div>
                      )}
                    </div>
                  )}

                  {/* Resumo */}
                  {selectedService && selectedDate && selectedTime && (
                    <Card className="bg-accent">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold mb-3">Resumo do Agendamento</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Barbearia:</strong> {currentBarbershop?.name}
                          </p>
                          <p>
                            <strong>Serviço:</strong> {selectedServiceData?.name}
                          </p>
                          <p>
                            <strong>Data:</strong> {selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                          </p>
                          <p>
                            <strong>Horário:</strong> {selectedTime}
                          </p>
                          <p>
                            <strong>Valor:</strong> R$ {((selectedServiceData?.price_in_cents || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      submitting ||
                      !selectedService ||
                      !selectedDate ||
                      !selectedTime
                    }
                  >
                    {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Modal de Sucesso */}
            {bookingSuccess && lastBooking && (
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="text-green-600 text-4xl">✅</div>
                    <h3 className="text-lg font-semibold text-green-800">Agendamento Confirmado!</h3>
                    <p className="text-green-700">Seu agendamento foi realizado com sucesso.</p>

                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-2">Detalhes do Agendamento:</h4>
                      <div className="space-y-1 text-sm text-left">
                        <p>
                          <strong>Barbearia:</strong> {lastBooking.barbershop_name}
                        </p>
                        <p>
                          <strong>Serviço:</strong> {lastBooking.service_name}
                        </p>
                        <p>
                          <strong>Data:</strong> {format(new Date(lastBooking.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <p>
                          <strong>Horário:</strong> {format(new Date(lastBooking.appointment_date), 'HH:mm')}
                        </p>
                        <p>
                          <strong>Valor:</strong> R$ {((lastBooking.service_price || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setBookingSuccess(false)
                        setSelectedBarbershop('')
                        setSelectedService('')
                        setSelectedDate('')
                        setSelectedTime('')
                      }}
                      className="w-full"
                    >
                      Fechar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
