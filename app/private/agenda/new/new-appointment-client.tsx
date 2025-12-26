'use client'

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, User, Scissors, MapPin } from "lucide-react"
import { CalendarWithAppointments } from "@/app/components/calendar-with-appointments"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Customer = { id: string; name: string; phone: string }
type Service = { id: string; name: string; duration: number; price: number; commission_rate?: number }
type Professional = { id: string; name: string; email: string; position?: string }

export function NewAppointmentClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Form state
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [status, setStatus] = useState("pending")

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setFetching(true)
      setError(null)

      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name, phone")
        .order("name")

      if (customersError) throw customersError

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, name, duration, price, commission_rate")
        .order("name")

      if (servicesError) throw servicesError

      // Load professionals (employees)
      const { data: professionalsData, error: professionalsError } = await supabase
        .from("employees")
        .select("id, name, email, position")
        .eq("status", "active")
        .order("name")

      if (professionalsError) throw professionalsError

      setCustomers(customersData || [])
      setServices(servicesData || [])
      setProfessionals(professionalsData || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados"
      setError(message)
      toast.error(message)
    } finally {
      setFetching(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!date || !time || !customerId) {
        throw new Error("Data, hora e cliente são obrigatórios")
      }

      const appointmentData = {
        appointment_date: date,
        appointment_time: `${time}:00`,
        status: status || "pending",
        customer_id: customerId,
        service_id: serviceId || null,
        professional_id: professionalId || null,
      }

      const { data: appointmentInserted, error: insertError } = await supabase
        .from("appointments")
        .insert([appointmentData])
        .select()

      if (insertError) throw insertError
      if (!appointmentInserted || appointmentInserted.length === 0) {
        throw new Error("Falha ao criar agendamento")
      }

      const appointmentId = appointmentInserted[0].id
      let transactionId: string | null = null

      // Get service amount if service is selected
      if (serviceId) {
        const selectedService = services.find(s => s.id === serviceId)
        const selectedCustomer = customers.find(c => c.id === customerId)
        
        if (selectedService && selectedCustomer) {
          const transactionData = {
            appointment_id: appointmentId,
            type: "income",
            category: "Serviço",
            description: `Serviço: ${selectedService.name} - Cliente: ${selectedCustomer.name}`,
            amount: selectedService.price,
            date: date,
            payment_method: null,
            status: "pending",
          }

          const { data: transactionInserted, error: transactionError } = await supabase
            .from("transactions")
            .insert([transactionData])
            .select()

          if (transactionError) {
            console.error("Erro ao criar transação:", transactionError)
          } else if (transactionInserted && transactionInserted.length > 0) {
            transactionId = transactionInserted[0].id
          }

          // Create professional revenue record if professional is assigned
          if (professionalId) {
            const professionalRevenueData = {
              professional_id: professionalId,
              appointment_id: appointmentId,
              transaction_id: transactionId,
              service_name: selectedService.name,
              customer_name: selectedCustomer.name,
              revenue: selectedService.price,
              revenue_date: date,
              appointment_date: date,
              appointment_time: time,
              status: "pending",
            }

            const { error: revenueError } = await supabase
              .from("professional_revenue")
              .insert([professionalRevenueData])

            if (revenueError) {
              console.error("Erro ao registrar lucro do profissional:", revenueError)
            }

            // Create professional commission record if professional is assigned
            // Commission is calculated based on service commission rate (default 15%)
            const commissionRate = selectedService.commission_rate || 15.00
            const commissionAmount = (parseFloat(selectedService.price.toString()) * commissionRate) / 100

            const professionalCommissionData = {
              professional_id: professionalId,
              appointment_id: appointmentId,
              transaction_id: transactionId,
              service_name: selectedService.name,
              customer_name: selectedCustomer.name,
              service_price: selectedService.price,
              commission_rate: commissionRate,
              commission_amount: commissionAmount,
              commission_period: date,
              status: "pending",
            }

            const { error: commissionError } = await supabase
              .from("professional_commissions")
              .insert([professionalCommissionData])

            if (commissionError) {
              console.error("Erro ao registrar comissão do profissional:", commissionError)
            }
          }
        }
      }

      // Invalidate appointments cache to trigger refresh
      await queryClient.invalidateQueries({
        queryKey: ["appointments-month"],
      })

      toast.success("Agendamento criado com sucesso!")
      router.push("/private/agenda")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar agendamento"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2">Novo Agendamento</h1>
            <p className="text-gray-600 dark:text-slate-300 text-lg">Escolha a data, horário, cliente e serviço para criar um novo agendamento</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Calendar and Time */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-blue-200 dark:border-slate-600 shadow-lg dark:bg-slate-800">
                <CardContent className="pt-8">
                  <CalendarWithAppointments
                    selectedDate={date}
                    onDateSelect={setDate}
                    selectedTime={time}
                    onTimeSelect={setTime}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-4">
              {/* Summary Card */}
              <Card className="border-2 border-blue-200 dark:border-slate-600 shadow-lg bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 dark:text-slate-100">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {date && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 uppercase font-semibold">Data</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {(() => {
                            const [year, month, day] = date.split('-').map(Number)
                            return format(new Date(year, month - 1, day), "dd 'de' MMMM", { locale: ptBR })
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                  {time && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 uppercase font-semibold">Horário</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{time.substring(0, 5)}</p>
                      </div>
                    </div>
                  )}
                  {customerId && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 uppercase font-semibold">Cliente</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {customers.find(c => c.id === customerId)?.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {serviceId && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 uppercase font-semibold">Serviço</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {services.find(s => s.id === serviceId)?.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {professionalId && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 uppercase font-semibold">Profissional</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {professionals.find(p => p.id === professionalId)?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Form Fields */}
              <Card className="border-2 border-gray-200 dark:border-slate-600 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-slate-100">Detalhes</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Select */}
                    <div>
                      <Label htmlFor="customer" className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Cliente *</span>
                      </Label>
                      <Select value={customerId || ""} onValueChange={setCustomerId}>
                        <SelectTrigger id="customer" className="border-2">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service Select */}
                    <div>
                      <Label htmlFor="service" className="flex items-center gap-2 mb-2">
                        <Scissors className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Serviço (Opcional)</span>
                      </Label>
                      <Select value={serviceId || ""} onValueChange={(value) => setServiceId(value || null)}>
                        <SelectTrigger id="service" className="border-2">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {service.duration.toString().substring(0, 5)}min
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Professional Select */}
                    <div>
                      <Label htmlFor="professional" className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Profissional (Opcional)</span>
                      </Label>
                      <Select value={professionalId || ""} onValueChange={(value) => setProfessionalId(value || null)}>
                        <SelectTrigger id="professional" className="border-2">
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((professional) => (
                            <SelectItem key={professional.id} value={professional.id}>
                              {professional.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Select */}
                    <div>
                      <Label htmlFor="status" className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Status</span>
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Button
                        type="submit"
                        disabled={loading || !date || !time || !customerId}
                        className="w-full h-12 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {loading ? "Salvando..." : "Agendar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="w-full h-10"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
