"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface Service {
  id: string;
  name: string;
  duration: string | number;
  price: number;
  imageUrl?: string;
  category?: string;
  description?: string;
}

interface Professional {
  id: string;
  name: string;
  position?: string;
  department?: string;
  imageUrl?: string;
}

interface AppointmentData {
  id: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  professional: string;
  service: string;
  email: string;
}

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingFlowModal({ isOpen, onClose }: BookingFlowModalProps) {
  const supabase = createClient();

  // Estado dos modais
  const [currentStep, setCurrentStep] = useState<"menu" | "categories" | "services" | "professionals" | "date" | "time" | "checkout" | "success">("menu");

  // Seleções
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dados
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);

  // Formulário de checkout
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthday: "",
    notes: "",
    password: "",
  });
  const [checkoutTab, setCheckoutTab] = useState<'register' | 'login'>('register');

  // Buscar dados do usuário do localStorage
  const [bookingUser, setBookingUser] = useState<{ name?: string; phone?: string } | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Carregar usuário do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookingUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookingUser(parsed);

        // Registrar cliente no Supabase
        if (parsed?.name && parsed?.phone) {
          fetch("/api/register-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: parsed.name, phone: parsed.phone }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.customerId) {
                setCustomerId(data.customerId);
              }
            })
            .catch(() => {
              // Handle error silently
            });
        }
      }
    } catch {
      // Handle error silently
    }
  }, []);

  // Serviços e profissionais estáticos como fallback
  const staticServices: Service[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Corte de Cabelo",
      duration: "01:00:00",
      price: 60,
      imageUrl: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      category: "Cabelos",
      description: "Corte de cabelo personalizado",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Barba",
      duration: "00:20:00",
      price: 40,
      imageUrl: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      category: "Barba",
      description: "Aparação e finalização de barba",
    },
  ];

  const staticProfessionals: Professional[] = [
    {
      id: "650e8400-e29b-41d4-a716-446655440001",
      name: "Vitor",
      position: "Barbeiro",
      department: "Salão",
      imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440002",
      name: "Vinícius",
      position: "Barbeiro",
      department: "Salão",
      imageUrl: "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
    },
  ];

  // Carregar serviços
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name, duration, price, image_url, category, description");

        if (error || !data || data.length === 0) {
          setServices(staticServices);
        } else {
          const mappedServices: Service[] = data.map((s: Record<string, unknown>) => ({
            id: String(s.id),
            name: String(s.name),
            price: typeof s.price === "number" ? s.price : 0,
            duration: String(s.duration || ""),
            imageUrl: s.image_url ? String(s.image_url) : undefined,
            category: s.category ? String(s.category) : "Outros",
            description: s.description ? String(s.description) : undefined,
          }));
          setServices(mappedServices);
        }
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        setServices(staticServices);
      }
    };

    if (isOpen) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Carregar profissionais
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, name, position, department, image_url");

        if (error || !data || data.length === 0) {
          setProfessionals(staticProfessionals);
        } else {
          const mappedProfessionals: Professional[] = data.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            name: String(p.name),
            position: p.position ? String(p.position) : undefined,
            department: p.department ? String(p.department) : undefined,
            imageUrl: p.image_url ? String(p.image_url) : undefined,
          }));
          setProfessionals(mappedProfessionals);
        }
      } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
        setProfessionals(staticProfessionals);
      }
    };

    if (isOpen) {
      fetchProfessionals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Gerar calendário do mês
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Gerar horários disponíveis
  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    return times;
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep("services");
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep("professionals");
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setCurrentStep("date");
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Salvar agendamento no Supabase
  const saveAppointment = async () => {
    setLoading(true);
    try {
      if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
        setAppointmentData(null);
        setCurrentStep("success");
        setLoading(false);
        return;
      }

      const finalCustomerId = customerId || (bookingUser?.phone ? `temp_${bookingUser.phone}` : null);

      if (!finalCustomerId && (!bookingUser?.name || !bookingUser?.phone)) {
        setAppointmentData(null);
        setCurrentStep("success");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/create-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: finalCustomerId,
          serviceId: selectedService.id,
          professionalId: selectedProfessional.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          customerName: bookingUser?.name,
          customerPhone: bookingUser?.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const servico = selectedService.name || "";
        const profissional = selectedProfessional.name || "";
        let dataFormatada = "";
        if (selectedDate) {
          const partes = selectedDate.split("-");
          if (partes.length === 3) {
            dataFormatada = `${partes[2]} de ${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][parseInt(partes[1]) - 1]} de ${partes[0]}`;
          } else {
            dataFormatada = selectedDate;
          }
        }

        setAppointmentData({
          id: result.appointmentId || Math.floor(Math.random() * 10000).toString(),
          date: dataFormatada,
          time: selectedTime,
          clientName: bookingUser?.name || "",
          phone: bookingUser?.phone || "",
          professional: profissional,
          service: servico,
          email: "Seu email"
        });

        setCurrentStep("success");
      } else {
        setAppointmentData(null);
        setCurrentStep("success");
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      setAppointmentData(null);
      setCurrentStep("success");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case "menu":
        onClose();
        break;
      case "categories":
        setCurrentStep("menu");
        break;
      case "services":
        setCurrentStep("categories");
        setSelectedCategory(null);
        break;
      case "professionals":
        setCurrentStep("services");
        setSelectedService(null);
        break;
      case "date":
        setCurrentStep("professionals");
        setSelectedProfessional(null);
        break;
      case "time":
        setCurrentStep("date");
        setSelectedTime("");
        break;
      case "checkout":
        setCurrentStep("time");
        break;
      case "success":
        onClose();
        break;
    }
  };

  const getProgress = () => {
    const steps = ["menu", "categories", "services", "professionals", "date", "time", "checkout", "success"];
    return steps.indexOf(currentStep) + 1;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl max-h-[95vh] animate-in zoom-in-95 overflow-hidden flex flex-col">
        
        {/* Progress bar - TOPO */}
        <div className="bg-white px-8 py-6 flex justify-start shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className={`w-3 h-3 rounded-full transition-all ${
                  dot <= getProgress() ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo com sidebar - FLEX ROW */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Sidebar esquerda */}
          <div className="w-56 bg-gray-100 flex flex-col items-center justify-center p-6 border-r border-gray-200 shrink-0">
            <div className="flex flex-col items-center gap-6">
              {/* Checkmark */}
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {/* Texto */}
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                {currentStep === "categories" && "Qual serviço deseja fazer?"}
                {currentStep === "services" && "Qual serviço deseja fazer?"}
                {currentStep === "professionals" && "Qual profissional deseja escolher?"}
                {currentStep === "date" && "Qual data e hora você escolhe?"}
                {currentStep === "time" && "Qual data e hora você escolhe?"}
                {currentStep === "checkout" && "Coloque suas informações"}
              </p>
            </div>
          </div>

          {/* Conteúdo principal - SCROLLÁVEL */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {currentStep === "menu" && "Opções"}
                    {currentStep === "categories" && "Selecione um serviço"}
                    {currentStep === "services" && "Selecione um serviço"}
                    {currentStep === "professionals" && "Selecione um profissional"}
                    {currentStep === "date" && "Selecione a data e hora"}
                    {currentStep === "time" && "Selecione a data e hora"}
                    {currentStep === "checkout" && "Finalize seu agendamento"}
                    {currentStep === "success" && "Agendamento confirmado"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-0 h-auto text-gray-600 hover:bg-transparent text-xl shrink-0 bg-transparent cursor-pointer border-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Menu */}
                {currentStep === "menu" && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setCurrentStep("categories")}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
                    >
                      📅 Agendar
                    </button>
                    <button
                      onClick={() => {/* Mostrar serviços */}}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
                    >
                      ✂️ Serviços
                    </button>
                    <button
                      onClick={() => {/* Mostrar profissionais */}}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
                    >
                      👥 Profissionais
                    </button>
                  </div>
                )}

                {/* Categorias */}
                {currentStep === "categories" && (
                  <div className="space-y-3 overflow-visible">
                    {Array.from(new Set(services.map(s => s.category || "Outros"))).sort().map((category) => {
                      const categoryService = services.find(s => s.category === category);
                      return (
                        <div key={category} className="overflow-visible">
                          <button
                            onClick={() => handleCategorySelect(category)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 hover:scale-105 origin-center group ${
                              selectedCategory === category
                                ? 'border-blue-400 bg-blue-50 text-blue-900 font-semibold'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                              {categoryService?.imageUrl ? (
                                <Image 
                                  src={categoryService.imageUrl} 
                                  alt={category}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                  {category.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="transition-transform duration-200 group-hover:scale-105 origin-left">{category}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Serviços */}
                {currentStep === "services" && selectedCategory && (
                  <div className="space-y-3 overflow-visible">
                    {services.filter(s => s.category === selectedCategory).map((service) => (
                      <div key={service.id} className="overflow-visible">
                        <button
                          onClick={() => handleServiceSelect(service)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group hover:scale-105 origin-center cursor-pointer ${
                            selectedService?.id === service.id 
                              ? 'border-blue-300 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-16 h-16 shrink-0 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                            {service.imageUrl ? (
                              <Image 
                                src={service.imageUrl} 
                                alt={service.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                {service.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-gray-900 text-base transition-transform duration-200 group-hover:scale-105 origin-left">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2 transition-transform duration-200 group-hover:scale-105 origin-left">{service.description}</div>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {service.price && <div className="text-base font-normal text-gray-400">R$ {service.price}</div>}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Profissionais */}
                {currentStep === "professionals" && (
                  <div className="space-y-3 overflow-visible">
                    {professionals && professionals.length > 0 ? (
                      professionals.map((professional) => (
                        <div key={professional.id} className="overflow-visible">
                          <button
                            onClick={() => handleProfessionalSelect(professional)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group hover:scale-105 origin-center ${
                              selectedProfessional?.id === professional.id 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-gray-300 overflow-hidden box-border">
                              {professional.imageUrl ? (
                                <Image 
                                  src={professional.imageUrl} 
                                  alt={professional.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg lg:text-2xl">
                                  {professional.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-gray-900 text-base lg:text-lg transition-transform duration-200 group-hover:scale-105 origin-left">{professional.name}</div>
                              {professional.position && (
                                <div className="text-sm text-gray-500 mt-1 transition-transform duration-200 group-hover:scale-105 origin-left">{professional.position}</div>
                              )}
                              {professional.department && (
                                <div className="text-xs text-gray-600 mt-1 transition-transform duration-200 group-hover:scale-105 origin-left">{professional.department}</div>
                              )}
                            </div>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">Nenhum profissional encontrado</div>
                    )}
                  </div>
                )}

                {/* Datas e Horários */}
                {currentStep === "date" && (
                  <div className="grid grid-cols-2 gap-8">
                    {/* CALENDÁRIO */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center justify-between w-full mb-6 gap-4 pb-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {(() => {
                            const dateStr = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).slice(1);
                            const [month, year] = dateStr.split(' de ');
                            return (
                              <span>
                                {month} <span className="text-gray-400">{year}</span>
                              </span>
                            );
                          })()}
                        </h3>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newMonth = new Date(currentMonth);
                              newMonth.setMonth(newMonth.getMonth() - 1);
                              setCurrentMonth(newMonth);
                            }}
                            disabled={currentMonth.getFullYear() === new Date().getFullYear() && currentMonth.getMonth() === new Date().getMonth()}
                            className="p-3 h-auto bg-transparent hover:bg-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-3xl text-gray-900">‹</span>
                          </button>
                          <button
                            onClick={() => {
                              const newMonth = new Date(currentMonth);
                              newMonth.setMonth(newMonth.getMonth() + 1);
                              setCurrentMonth(newMonth);
                            }}
                            className="p-3 h-auto bg-transparent hover:bg-transparent focus:outline-none"
                          >
                            <span className="text-3xl text-gray-900">›</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2 w-full">
                        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-blue-400 py-1">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 w-full">
                        {getCalendarDays(currentMonth).map((day, index) => {
                          if (day === null) {
                            return <div key={`empty-${index}`} className="h-8" />;
                          }

                          const dateStr: string = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                          const isAvailable: boolean = selectedDateObj >= today;

                          return (
                            <button
                              key={`date-${day}`}
                              onClick={() => handleDateSelect(dateStr)}
                              disabled={!isAvailable}
                              className={`h-10 rounded font-medium text-sm transition-all flex items-center justify-center ${
                                selectedDate === dateStr
                                  ? 'bg-gray-900 text-white cursor-pointer'
                                  : isAvailable
                                  ? 'text-teal-600 bg-white hover:bg-teal-50 cursor-pointer border border-teal-200'
                                  : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* HORÁRIOS */}
                    <div className="flex flex-col">
                      {selectedDate ? (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4 text-base">
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {getAvailableTimes().map((time) => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`py-2 px-2 rounded font-medium text-xs transition-all flex items-center justify-center gap-1 border ${
                                  selectedTime === time
                                    ? 'bg-gray-900 text-white cursor-pointer border-gray-900'
                                    : 'bg-transparent text-gray-900 hover:border-blue-300 cursor-pointer border-gray-300'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          Selecione uma data
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Checkout */}
                {currentStep === "checkout" && (
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
                      <button
                        onClick={() => setCheckoutTab('register')}
                        className={`pb-2 font-semibold transition-all whitespace-nowrap text-sm lg:text-base ${
                          checkoutTab === 'register'
                            ? 'text-blue-600 border-b-2 border-blue-600 -mb-4'
                            : 'text-gray-500 border-b-2 border-transparent'
                        }`}
                      >
                        Cadastrar
                      </button>
                      <button
                        onClick={() => setCheckoutTab('login')}
                        className={`pb-2 font-semibold transition-all whitespace-nowrap text-sm lg:text-base ${
                          checkoutTab === 'login'
                            ? 'text-blue-600 border-b-2 border-blue-600 -mb-4'
                            : 'text-gray-500 border-b-2 border-transparent'
                        }`}
                      >
                        Já tenho uma conta
                      </button>
                    </div>

                    {checkoutTab === 'register' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Seu nome"
                            value={checkoutForm.firstName}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Seu sobrenome"
                            value={checkoutForm.lastName}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <input
                          type="tel"
                          placeholder="(XX) 98233-5184"
                          value={checkoutForm.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = value;
                            if (value.length > 0) {
                              if (value.length <= 2) {
                                formatted = `(${value}`;
                              } else if (value.length <= 7) {
                                formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                              } else {
                                formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                              }
                            }
                            setCheckoutForm(prev => ({ ...prev, phone: formatted }));
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={checkoutForm.birthday}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, birthday: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          placeholder="Observações"
                          value={checkoutForm.notes}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                        />
                      </>
                    ) : (
                      <div className="space-y-6">
                        <input
                          type="tel"
                          placeholder="(XX) 98233-5184"
                          value={checkoutForm.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = value;
                            if (value.length > 0) {
                              if (value.length <= 2) {
                                formatted = `(${value}`;
                              } else if (value.length <= 7) {
                                formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                              } else {
                                formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                              }
                            }
                            setCheckoutForm(prev => ({ ...prev, phone: formatted }));
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Sua senha"
                          value={checkoutForm.password}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-center">
                          <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                            Esqueceu a senha?
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sucesso */}
                {currentStep === "success" && appointmentData && (
                  <div className="text-center">
                    <div className="flex justify-center mb-6">
                      <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg">
                          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Agendamento confirmado</h2>
                    <p className="text-gray-500 text-lg font-semibold mb-6">#{appointmentData.id}</p>

                    <div className="space-y-4 mb-8 text-left">
                      <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-2">Data:</div>
                          <div className="text-gray-900 font-semibold text-sm">{appointmentData.date}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-2">Nome:</div>
                          <div className="text-gray-900 font-semibold text-sm">{appointmentData.clientName}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-2">Hora:</div>
                          <div className="text-gray-900 font-semibold text-sm">{appointmentData.time}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-2">Telefone:</div>
                          <div className="text-gray-900 font-semibold text-sm">{appointmentData.phone}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-2">Profissional:</div>
                          <div className="text-gray-900 font-semibold text-sm">{appointmentData.professional}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-2">Serviço:</div>
                          <div className="text-gray-900 font-semibold text-sm">{appointmentData.service}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões do rodapé - FIXO */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-6 lg:p-8 space-y-3">
              <Button
                onClick={goBack}
                variant="outline"
                className="w-full"
              >
                ← Voltar
              </Button>
              {currentStep !== "success" && (
                <Button
                  onClick={() => {
                    if (currentStep === "categories" && selectedCategory) {
                      setCurrentStep("services");
                    } else if (currentStep === "services" && selectedService) {
                      setCurrentStep("professionals");
                    } else if (currentStep === "professionals" && selectedProfessional) {
                      setCurrentStep("date");
                    } else if (currentStep === "date" && selectedDate && selectedTime) {
                      setCurrentStep("checkout");
                    } else if (currentStep === "checkout") {
                      saveAppointment();
                    }
                  }}
                  disabled={
                    (currentStep === "categories" && !selectedCategory) ||
                    (currentStep === "services" && !selectedService) ||
                    (currentStep === "professionals" && !selectedProfessional) ||
                    (currentStep === "date" && (!selectedDate || !selectedTime)) ||
                    loading
                  }
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {currentStep === "checkout" ? "Confirmar Agendamento" : "Próximo passo →"}
                </Button>
              )}
              {currentStep === "success" && (
                <Button
                  onClick={onClose}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>

          {/* Resumo à direita - FIXO */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 hidden lg:flex flex-col shrink-0 overflow-hidden">
            {/* Conteúdo do resumo scrollável */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo</h3>
              <div className="space-y-4">
                {selectedService && (
                  <div className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Serviço</div>
                    <div className="flex items-center gap-2">
                      {selectedService.imageUrl ? (
                        <Image 
                          src={selectedService.imageUrl} 
                          alt={selectedService.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                          {selectedService.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-right font-semibold text-gray-900 text-sm">{selectedService.name}</div>
                    </div>
                  </div>
                )}
                {selectedService && selectedService.price && (
                  <div className="flex justify-between items-center gap-4 py-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Valor</div>
                    <div className="text-right font-normal text-gray-400 text-sm">R$ {selectedService.price}</div>
                  </div>
                )}
                {selectedProfessional && (
                  <div className="flex justify-between items-center gap-4 py-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Profissional</div>
                    <div className="flex items-center gap-2">
                      {selectedProfessional.imageUrl ? (
                        <Image 
                          src={selectedProfessional.imageUrl} 
                          alt={selectedProfessional.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs">
                          {selectedProfessional.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-right font-semibold text-gray-900 text-sm">{selectedProfessional.name}</div>
                    </div>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Data</div>
                    <div className="text-right font-semibold text-gray-900 text-sm">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-start gap-4 pt-4">
                    <div className="text-sm text-gray-500">Hora</div>
                    <div className="text-right font-semibold text-gray-900 text-sm">{selectedTime}</div>
                  </div>
                )}
                {!selectedService && !selectedProfessional && !selectedDate && !selectedTime && (
                  <div className="text-center text-gray-500 py-8">
                    Selecione um item
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
