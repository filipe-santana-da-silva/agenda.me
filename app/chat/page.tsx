"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";

// Type definitions
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

interface MessageOption {
  id: string;
  label: string;
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

const ChatPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mensagens do chat (sem IA)
  const [messages, setMessages] = useState<Array<{ 
    id: string; 
    role: "user" | "assistant"; 
    parts: Array<{ type: string; text: string }> 
  }>>([]);

  // Carregar dados do cliente do localStorage
  const [bookingUser, setBookingUser] = useState<{ name?: string; phone?: string } | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Função para adicionar mensagem (substitui useChat)
  const sendMessage = (message: { text: string }) => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, {
      id,
      role: "assistant",
      parts: [{ type: "text", text: message.text }]
    }]);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bookingUser");
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookingUser(parsed);
        
        // Registrar cliente no Supabase apenas se tiver nome e telefone
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [input, setInput] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Estados para agendamento guiado por perguntas
  const [appointment, setAppointment] = useState({
    service_id: "",
    professional_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [awaitingInput, setAwaitingInput] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messageOptions, setMessageOptions] = useState<Record<string, MessageOption[]>>({});

  // Buscar serviços e profissionais reais do Supabase
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  // Serviços estáticos do seed - DEVE estar antes do useEffect
  const staticServices: Service[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Corte de Cabelo",
      duration: "01:00:00",
      price: 60,
      imageUrl: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      category: "Cabelos",
      description: "Corte de cabelo personalizado com tesoura e/ou máquina, realizado por nossos profissionais experientes.",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Barba",
      duration: "00:20:00",
      price: 40,
      imageUrl: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      category: "Barba",
      description: "Aparação e finalização de barba com acabamento perfeito e produtos de qualidade.",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Pézinho",
      duration: "00:30:00",
      price: 35,
      imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      category: "Corpo",
      description: "Aparação dos pelos da nuca e contorno do rosto para um acabamento limpo e preciso.",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Sobrancelha",
      duration: "00:15:00",
      price: 20,
      imageUrl: "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
      category: "Rosto",
      description: "Design e preenchimento de sobrancelha para um visual mais definido e harmonioso.",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "Massagem",
      duration: "00:45:00",
      price: 50,
      imageUrl: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
      category: "Bem-estar",
      description: "Massagem relaxante para aliviar tensões e promover bem-estar físico e mental.",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "Hidratação",
      duration: "00:30:00",
      price: 25,
      imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      category: "Tratamentos",
      description: "Tratamento hidratante intensivo para peles ressecadas e descamação, com produtos premium.",
    },
  ];

  // Profissionais estáticos do seed - DEVE estar antes do useEffect
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
    {
      id: "650e8400-e29b-41d4-a716-446655440003",
      name: "João Pedro",
      position: "Barbeiro",
      department: "Salão",
      imageUrl: "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440004",
      name: "Carlos",
      position: "Barbeiro",
      department: "Salão",
      imageUrl: "https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png",
    },
    {
      id: "650e8400-e29b-41d4-a716-446655440005",
      name: "Lucas",
      position: "Barbeiro",
      department: "Salão",
      imageUrl: "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
    },
  ];

  useEffect(() => {
    // Usar dados mock por padrão (em desenvolvimento)
    console.log("Usando dados mock para serviços e profissionais");
    setServices(staticServices);
    setProfessionals(staticProfessionals);
  }, [staticServices, staticProfessionals]);

  // Estados das opções interativas
  const [hasInitiated, setHasInitiated] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showViewServicesModal, setShowViewServicesModal] = useState(false);
  const [showProfessionalsModal, setShowProfessionalsModal] = useState(false);
  const [showViewProfessionalsModal, setShowViewProfessionalsModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTab, setCheckoutTab] = useState<'register' | 'login'>('register');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthday: "",
    notes: "",
    password: "",
  });

  // Função para agrupar serviços por categoria
  const groupServicesByCategory = (srvcs: Service[]) => {
    const grouped: { [key: string]: Service[] } = {};
    srvcs.forEach(service => {
      const category = service.category || "Outros";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    return grouped;
  };

  // Inicia o fluxo de perguntas ao abrir o chat
  useEffect(() => {
    if (!hasInitiated && messages.length === 0) {
      setHasInitiated(true);
      setShowCategoriesModal(true);
      sendMessage({ 
        text: "Olá! 👋 Bem-vindo ao Agenda.ai\n\nComo posso ajudá-lo?"
      });
    }
    // eslint-disable-next-line
  }, [hasInitiated]);

  // Listar serviços
  const handleShowServices = async () => {
    if (services && services.length > 0) {
      setShowViewServicesModal(true);
    } else {
      sendMessage({ text: "Nenhum serviço encontrado." });
    }
  };

  // Lidar com seleção de serviço
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowServicesModal(false);
    setAppointment(prev => ({ ...prev, service_id: service.id }));
    setShowProfessionalsModal(true);
    setAwaitingInput("professional");
  };

  // Lidar com seleção de categoria
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoriesModal(false);
    setShowServicesModal(true);
  };

  // Lidar com seleção de profissional
  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowProfessionalsModal(false);
    setAppointment(prev => ({ ...prev, professional_id: professional.id }));
    setShowDateModal(true);
    setAwaitingInput("date");
  };

  // Gerar calendário do mês
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    // Ajustar para semana começar em segunda (SEG=0)
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

  // Voltar ao menu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBackToMenu = () => {
    sendMessage({ 
      text: "O que deseja fazer?"
    });
    setShowCategoriesModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveAppointment = async (appointmentData?: Record<string, unknown>) => {
    setLoading(true);
    try {
      // Usar dados passados ou valores do estado
      const finalAppointment = appointmentData || appointment;
      
      // Validação dos campos obrigatórios
      const apt = finalAppointment as Record<string, unknown>;
      if (!apt.service_id || !apt.professional_id || !apt.appointment_date || !apt.appointment_time) {
        setSuccessMessage("Preencha todos os campos obrigatórios do agendamento.");
        setShowSuccessModal(true);
        setLoading(false);
        return;
      }

      // Usar customerId obtido do registro via API, ou guestInfo como fallback
      const finalCustomerId = customerId || (bookingUser?.phone ? `temp_${bookingUser.phone}` : null);

      if (!finalCustomerId && (!bookingUser?.name || !bookingUser?.phone)) {
        setSuccessMessage("É necessário ter nome e telefone para agendar.");
        setShowSuccessModal(true);
        setLoading(false);
        return;
      }

      // Chamar API para criar agendamento com customer_id
      const response = await fetch("/api/create-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: finalCustomerId,
          serviceId: finalAppointment.service_id,
          professionalId: finalAppointment.professional_id,
          appointmentDate: finalAppointment.appointment_date,
          appointmentTime: finalAppointment.appointment_time,
          customerName: bookingUser?.name,
          customerPhone: bookingUser?.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("✅ Agendamento realizado com sucesso!");
        // Buscar nomes dos serviços e profissionais selecionados
        const servico = services.find(s => s.id === appointment.service_id)?.name || "";
        const profissional = professionals.find(p => p.id === appointment.professional_id)?.name || "";
        // Formatar data para padrão brasileiro
        let dataFormatada = "";
        if (appointment.appointment_date) {
          const partes = appointment.appointment_date.split("-");
          if (partes.length === 3) {
            dataFormatada = `${partes[2]} de ${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][parseInt(partes[1]) - 1]} de ${partes[0]}`;
          } else {
            dataFormatada = appointment.appointment_date;
          }
        }
        
        // Setar dados do agendamento para exibir no modal
        setAppointmentData({
          id: result.appointmentId || "3814",
          date: dataFormatada,
          time: appointment.appointment_time,
          clientName: bookingUser?.name || "",
          phone: bookingUser?.phone || "",
          professional: profissional,
          service: servico,
          email: "Seu email"
        });
        
        setShowSuccessModal(true);
        // Formatar data curta para o resumo da mensagem
        const dataExibicao = new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR');
        const resumo = `Resumo do agendamento:\nServiço: ${servico}\nProfissional: ${profissional}\nData: ${dataExibicao}\nHorário: ${appointment.appointment_time}`;
        sendMessage({ text: resumo });
        setAppointment({ service_id: "", professional_id: "", appointment_date: "", appointment_time: "" });
      } else {
        // Mostra mensagem detalhada do erro
        console.error("Erro na resposta da API:", result);
        setSuccessMessage("Erro ao agendar: " + (result.error || "Tente novamente."));
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      setSuccessMessage("Erro ao agendar. Tente novamente.");
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = () => {
    // Função mantida para referência futura, mas não está mais em uso
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isLoading = loading;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/booking">
          <Button variant="ghost" size="icon" className="size-6">
            <ChevronLeft className="size-6" />
          </Button>
        </Link>
        <div className="size-6" />
        <div className="size-6" />
      </header>



      {/* Modal Categorias */}
      {showCategoriesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col w-full h-[95vh] max-h-[95vh] overflow-hidden shrink-0 animate-in zoom-in-95 duration-300">
            {/* Progress bar - TOPO */}
            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 flex justify-start shrink-0">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-3 h-3 rounded-full transition-all ${
                      dot === 1 ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Conteúdo com sidebar - FLEX ROW em lg, COLUMN em mobile */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Sidebar esquerda - hidden em mobile */}
              <div className="hidden lg:flex w-56 bg-gray-100 flex-col items-center justify-center p-6 border-r border-gray-200 shrink-0">
                <div className="flex flex-col items-center gap-6">
                  {/* Checkmark */}
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Texto */}
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    Qual serviço deseja fazer?
                  </p>
                </div>
              </div>

              {/* Conteúdo principal - SCROLLÁVEL */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header mobile com sidebar info */}
                <div className="lg:hidden bg-gray-100 p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Qual serviço deseja fazer?</p>
                  </div>
                </div>
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
                      <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Selecione uma categoria</h2>
                      <button
                        onClick={() => {
                          router.push("/booking");
                        }}
                        className="p-0 h-auto text-gray-600 hover:bg-transparent text-lg sm:text-xl shrink-0 bg-transparent cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3 overflow-visible">
                      {Array.from(new Set(services.map(s => s.category || "Outros"))).sort().map((category) => {
                        const categoryService = services.find(s => s.category === category);
                        return (
                          <div key={category} className="overflow-visible">
                            <button
                              onClick={() => handleCategorySelect(category)}
                              className={`w-full text-left p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex items-center gap-3 sm:gap-4 hover:scale-105 origin-center group ${
                                selectedCategory === category
                                  ? 'border-blue-400 bg-blue-50 text-blue-900 font-semibold'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900'
                              }`}
                            >
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                                {categoryService?.imageUrl ? (
                                  <Image 
                                    src={categoryService.imageUrl} 
                                    alt={category}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                    {category.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm sm:text-base transition-transform duration-200 group-hover:scale-105 origin-left">{category}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botões do rodapé - FIXO */}
                <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-6 lg:p-8 space-y-3">
                  <Button
                    onClick={() => {
                      setShowCategoriesModal(false);
                      setAwaitingInput(null);
                    }}
                    variant="outline"
                    className="w-full text-sm sm:text-base"
                  >
                    ← Voltar
                  </Button>
                </div>
              </div>

              {/* Resumo à direita - FIXO em lg, hidden em mobile */}
              <div className="w-80 bg-gray-50 border-l border-gray-200 hidden lg:flex flex-col shrink-0 overflow-hidden">
                {/* Conteúdo do resumo scrollável */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo</h3>
                  <div className="space-y-0">
                    {selectedCategory && (
                      <div className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Categoria</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{selectedCategory}</div>
                      </div>
                    )}
                    {!selectedCategory && (
                      <div className="text-center text-gray-500 py-8">
                        Selecione uma categoria
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Serviços */}
      {showServicesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col w-full h-[95vh] max-h-[95vh] overflow-hidden shrink-0 animate-in zoom-in-95 duration-300">
            {/* Progress bar - TOPO */}
            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 flex justify-start shrink-0">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-3 h-3 rounded-full transition-all ${
                      dot <= 2 ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Conteúdo com sidebar - FLEX ROW em lg, COLUMN em mobile */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Sidebar esquerda - hidden em mobile */}
              <div className="hidden lg:flex w-80 bg-gray-100 flex-col items-center justify-center p-8 border-r border-gray-200 shrink-0">
                <div className="flex flex-col items-center gap-6">
                  {/* Checkmark */}
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Texto */}
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    Qual serviço deseja fazer?
                  </p>
                </div>
              </div>

              {/* Conteúdo principal - SCROLLÁVEL */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header mobile com sidebar info */}
                <div className="lg:hidden bg-gray-100 p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Qual serviço deseja fazer?</p>
                  </div>
                </div>
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
                      <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Selecione um serviço</h2>
                      <button
                        onClick={() => {
                          router.push("/booking");
                        }}
                        className="p-0 h-auto text-gray-600 hover:text-gray-800 text-lg sm:text-xl shrink-0 bg-transparent border-0"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 sm:space-y-3 overflow-visible">
                      {selectedCategory && services.filter(s => s.category === selectedCategory).map((service) => (
                      <div key={service.id} className="overflow-visible">
                        <button
                          onClick={() => handleServiceSelect(service)}
                          className={`w-full flex items-center gap-3 sm:gap-4 p-2 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 group hover:scale-105 origin-center cursor-pointer ${
                            selectedService?.id === service.id 
                              ? 'border-blue-300 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                            {service.imageUrl ? (
                              <Image 
                                src={service.imageUrl} 
                                alt={service.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                                {service.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base transition-transform duration-200 group-hover:scale-105 origin-left">{service.name}</div>
                            {service.description && (
                              <div className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 transition-transform duration-200 group-hover:scale-105 origin-left">{service.description}</div>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {service.price && <div className="text-sm sm:text-base font-normal text-gray-400">R$ {service.price}</div>}
                          </div>
                        </button>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>

                {/* Botões do rodapé - FIXO */}
                <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-6 lg:p-8 space-y-3">
                  <Button
                    onClick={() => {
                      setShowServicesModal(false);
                      setShowCategoriesModal(true);
                    }}
                    variant="outline"
                    className="w-full text-sm sm:text-base"
                  >
                    ← Voltar
                  </Button>
                </div>
              </div>

              {/* Resumo à direita - FIXO em lg, hidden em mobile */}
              <div className="w-80 bg-gray-50 border-l border-gray-200 hidden lg:flex flex-col shrink-0 overflow-hidden">
                {/* Conteúdo do resumo scrollável */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo</h3>
                  <div className="space-y-0">
                    {selectedService && (
                      <>
                        <div className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200">
                          <div className="text-sm text-gray-500">Serviço</div>
                          <div className="text-right font-semibold text-gray-900 text-sm">{selectedService.name}</div>
                        </div>
                        {selectedService.price && (
                          <div className="flex justify-between items-center gap-4 pt-4">
                            <div className="text-sm text-gray-500">Valor</div>
                            <div className="text-right font-normal text-gray-400 text-sm">R$ {selectedService.price}</div>
                          </div>
                        )}
                      </>
                    )}
                    {!selectedService && (
                      <div className="text-center text-gray-500 py-8">
                        Selecione um serviço
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col w-full h-[95vh] max-h-[95vh] overflow-hidden shrink-0 animate-in zoom-in-95 duration-300">
            {/* Progress bar - TOPO */}
            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 flex justify-start shrink-0">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-3 h-3 rounded-full transition-all ${
                      dot === 4 ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Conteúdo com sidebar - FLEX ROW em lg, COLUMN em mobile */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Sidebar esquerda - hidden em mobile */}
              <div className="hidden lg:flex w-56 bg-gray-100 flex-col items-center justify-center p-6 border-r border-gray-200 shrink-0">
                <div className="flex flex-col items-center gap-6">
                  {/* Checkmark */}
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Texto */}
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    Qual data e hora você escolhe?
                  </p>
                </div>
              </div>

              {/* Conteúdo principal - NO MEIO - SCROLLÁVEL */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header mobile com sidebar info */}
                <div className="lg:hidden bg-gray-100 p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Qual data e hora você escolhe?</p>
                  </div>
                </div>
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
                      <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Selecione a data e hora</h2>
                      <button
                      onClick={() => {
                        router.push("/booking");
                      }}
                      className="p-0 text-gray-600 hover:text-gray-800 text-lg sm:text-xl shrink-0 bg-transparent cursor-pointer"
                    >
                      ✕
                    </button>
                    </div>

                    {/* Grid: Calendário e Horários stacked em mobile, lado a lado em lg */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                      {/* CALENDÁRIO */}
                      <div className="flex flex-col items-start">
                        {/* Título do mês com navegação */}
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

                        {/* Navegação de mês */}
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

                        {/* Dias da semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2 w-full">
                          {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-blue-400 py-1">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Grid de datas */}
                          <div className="grid grid-cols-7 gap-1 w-full">
                          {getCalendarDays(currentMonth).map((day, index) => {
                            if (day === null) {
                              return (
                                <div key={`empty-${index}`} className="h-8" />
                              );
                            }

                            const dateStr: string = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            const rawDay = dateObj.getDay();
                            const dayWeekday = rawDay === 0 ? 6 : rawDay - 1;
                            
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            const isAvailable: boolean = selectedDate >= today;
                            const isSelected: boolean = appointment.appointment_date === dateStr;
                            const isWeekday: boolean = dayWeekday >= 0 && dayWeekday <= 4;

                            return (
                              <button
                                key={`date-${day}`}
                                onClick={() => {
                                  if (isAvailable) {
                                    setAppointment(prev => ({ ...prev, appointment_date: dateStr }));
                                  }
                                }}
                                disabled={!isAvailable}
                                className={`h-10 rounded font-medium text-sm transition-all flex items-center justify-center relative ${
                                  isSelected
                                    ? 'bg-gray-900 text-white cursor-pointer'
                                    : isAvailable
                                    ? isWeekday ? 'text-teal-600 bg-white hover:bg-teal-50 cursor-pointer' : 'text-teal-600 bg-gray-100 hover:bg-gray-200 cursor-pointer'
                                    : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                }`}
                                style={
                                  isAvailable && isWeekday && !isSelected
                                    ? {
                                        backgroundImage: 'linear-gradient(to bottom, transparent 85%, #93c5fd 85%)',
                                        backgroundSize: '100% 100%',
                                        backgroundRepeat: 'no-repeat',
                                      }
                                    : {}
                                }
                                onMouseEnter={(e) => {
                                  if (isAvailable) {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                }}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* HORÁRIOS */}
                      <div className="flex flex-col">
                        {appointment.appointment_date ? (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-4 text-base">
                              {new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                              {getAvailableTimes().map((time) => (
                                <button
                                  key={time}
                                  onClick={() => {
                                    setAppointment(prev => ({ ...prev, appointment_time: time }));
                                  }}
                                  className={`py-2 px-2 rounded font-medium text-xs transition-all flex items-center justify-center gap-1 border border-transparent ${
                                    appointment.appointment_time === time
                                      ? 'bg-gray-900 text-white cursor-pointer'
                                      : 'bg-transparent text-gray-900 hover:border-blue-300 cursor-pointer'
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
                  </div>
                </div>

                {/* Botões do rodapé - FIXO */}
                <div className="shrink-0 border-t border-gray-200 bg-white p-6 lg:p-8 flex gap-3 lg:hidden">
                  <Button
                    onClick={() => {
                      setShowDateModal(false);
                      setShowProfessionalsModal(true);
                      setAppointment(prev => ({
                        ...prev,
                        appointment_date: "",
                        appointment_time: ""
                      }));
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ← Voltar
                  </Button>
                  <button
                    onClick={() => {
                      if (appointment.appointment_date && appointment.appointment_time) {
                        setShowDateModal(false);
                        setShowCheckoutModal(true);
                      }
                    }}
                    disabled={!appointment.appointment_date || !appointment.appointment_time}
                    className="flex-1 py-2 px-8 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo passo →
                  </button>
                </div>
              </div>

              {/* Resumo à direita - FIXO */}
              <div className="w-80 bg-gray-50 border-l border-gray-200 hidden lg:flex flex-col shrink-0 overflow-hidden">
                {/* Conteúdo do resumo scrollável */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
                  <div className="space-y-0">
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
                    {appointment.appointment_date && (
                      <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Data</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                      </div>
                    )}
                    {appointment.appointment_time && (
                      <div className="flex justify-between items-start gap-4 pt-4">
                        <div className="text-sm text-gray-500">Hora</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{appointment.appointment_time}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Checkout - Cadastro/Login */}
      {showCheckoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg lg:rounded-3xl shadow-xl flex flex-col w-full max-w-5xl max-h-[95vh] overflow-hidden shrink-0 animate-in zoom-in-95 duration-300">
            {/* Progress bar - TOPO */}
            <div className="bg-white px-3 py-2 lg:px-8 lg:py-6 flex justify-start shrink-0 border-b border-gray-200">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all ${
                      dot === 4 ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Conteúdo principal - MOBILE FIRST */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Sidebar esquerda - hidden em mobile */}
              <div className="hidden lg:flex w-56 bg-gray-100 flex-col items-center justify-center p-6 border-r border-gray-200 shrink-0">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 text-center leading-relaxed">Coloque suas informações</p>
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 lg:p-8 pb-20 lg:pb-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 lg:mb-6">
                      <h3 className="text-xs lg:text-xl font-semibold text-gray-900">Finalize</h3>
                      <button
                        onClick={() => {
                          setShowCheckoutModal(false);
                          router.push("/booking");
                        }}
                        className="p-0 text-gray-600 hover:text-gray-800 text-sm lg:text-xl shrink-0 bg-transparent cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Abas */}
                    <div className="flex gap-2 mb-3 lg:mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
                      <button
                        onClick={() => setCheckoutTab('register')}
                        className={`pb-1 font-semibold transition-all whitespace-nowrap text-xs lg:text-base ${
                          checkoutTab === 'register'
                            ? 'text-blue-600 border-b-2 border-blue-600 -mb-2'
                            : 'text-gray-500 border-b-2 border-transparent'
                        }`}
                      >
                        Cadastrar
                      </button>
                      <button
                        onClick={() => setCheckoutTab('login')}
                        className={`pb-1 font-semibold transition-all whitespace-nowrap text-xs lg:text-base ${
                          checkoutTab === 'login'
                            ? 'text-blue-600 border-b-2 border-blue-600 -mb-2'
                            : 'text-gray-500 border-b-2 border-transparent'
                        }`}
                      >
                        Conta
                      </button>
                    </div>

                    {/* Formulário */}
                    <div className="space-y-2 lg:space-y-4">
                      {checkoutTab === 'register' ? (
                        <>
                          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 lg:gap-4">
                            <input
                              type="text"
                              placeholder="Nome"
                              value={checkoutForm.firstName}
                              onChange={(e) => setCheckoutForm(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Sobrenome"
                              value={checkoutForm.lastName}
                              onChange={(e) => setCheckoutForm(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <input
                            type="tel"
                            placeholder="Telefone"
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
                            className="w-full px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="date"
                            placeholder="Aniversário"
                            value={checkoutForm.birthday}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, birthday: e.target.value }))}
                            className="w-full px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </>
                      ) : (
                        <div className="space-y-2 lg:space-y-4">
                          <input
                            type="tel"
                            placeholder="Telefone"
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
                            className="w-full px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            placeholder="Senha"
                            value={checkoutForm.password}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button className="w-full text-blue-600 hover:text-blue-700 font-semibold text-xs lg:text-sm py-1">
                            Esqueceu?
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões rodapé */}
                <div className="shrink-0 border-t border-gray-200 bg-white p-6 lg:p-8 flex gap-3 lg:hidden">
                  <Button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setShowDateModal(true);
                    }}
                    variant="outline"
                    className="flex-1 text-xs lg:text-base py-2 lg:py-3"
                  >
                    ← Voltar
                  </Button>
                  <button
                    onClick={() => {
                      localStorage.setItem('bookingUser', JSON.stringify({
                        name: checkoutTab === 'register' ? `${checkoutForm.firstName} ${checkoutForm.lastName}` : '',
                        phone: checkoutForm.phone,
                      }));
                      setShowCheckoutModal(false);
                      
                      const servico = services.find(s => s.id === appointment.service_id)?.name || "";
                      const profissional = professionals.find(p => p.id === appointment.professional_id)?.name || "";
                      let dataFormatada = "";
                      if (appointment.appointment_date) {
                        const partes = appointment.appointment_date.split("-");
                        if (partes.length === 3) {
                          dataFormatada = `${partes[2]} de ${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][parseInt(partes[1]) - 1]} de ${partes[0]}`;
                        }
                      }
                      
                      setAppointmentData({
                        id: Math.floor(Math.random() * 10000).toString(),
                        date: dataFormatada,
                        time: appointment.appointment_time,
                        clientName: checkoutTab === 'register' ? `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim() : checkoutForm.firstName,
                        phone: checkoutForm.phone,
                        professional: profissional,
                        service: servico,
                        email: "Seu email"
                      });
                      
                      setSuccessMessage("Agendamento realizado com sucesso!");
                      setShowSuccessModal(true);
                      
                      const dataExibicao = new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR');
                      const resumo = `Resumo do agendamento:\nServiço: ${servico}\nProfissional: ${profissional}\nData: ${dataExibicao}\nHorário: ${appointment.appointment_time}`;
                      sendMessage({ text: resumo });
                    }}
                    className="flex-1 py-2 lg:py-3 px-4 lg:px-8 rounded-lg lg:rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all text-xs lg:text-sm"
                  >
                    Confirmar →
                  </button>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden lg:flex gap-2 border-t border-gray-200 p-2 lg:p-6 shrink-0 bg-white">
                  <Button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setShowDateModal(true);
                    }}
                    variant="outline"
                    className="flex-1 text-xs lg:text-base py-2 lg:py-3"
                  >
                    ← Voltar
                  </Button>
                  <button
                    onClick={() => {
                      localStorage.setItem('bookingUser', JSON.stringify({
                        name: checkoutTab === 'register' ? `${checkoutForm.firstName} ${checkoutForm.lastName}` : '',
                        phone: checkoutForm.phone,
                      }));
                      setShowCheckoutModal(false);
                      
                      const servico = services.find(s => s.id === appointment.service_id)?.name || "";
                      const profissional = professionals.find(p => p.id === appointment.professional_id)?.name || "";
                      let dataFormatada = "";
                      if (appointment.appointment_date) {
                        const partes = appointment.appointment_date.split("-");
                        if (partes.length === 3) {
                          dataFormatada = `${partes[2]} de ${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][parseInt(partes[1]) - 1]} de ${partes[0]}`;
                        }
                      }
                      
                      setAppointmentData({
                        id: Math.floor(Math.random() * 10000).toString(),
                        date: dataFormatada,
                        time: appointment.appointment_time,
                        clientName: checkoutTab === 'register' ? `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim() : checkoutForm.firstName,
                        phone: checkoutForm.phone,
                        professional: profissional,
                        service: servico,
                        email: "Seu email"
                      });
                      
                      setSuccessMessage("Agendamento realizado com sucesso!");
                      setShowSuccessModal(true);
                      
                      const dataExibicao = new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR');
                      const resumo = `Resumo do agendamento:\nServiço: ${servico}\nProfissional: ${profissional}\nData: ${dataExibicao}\nHorário: ${appointment.appointment_time}`;
                      sendMessage({ text: resumo });
                    }}
                    className="flex-1 py-2 lg:py-3 px-4 lg:px-8 rounded-lg lg:rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all text-xs lg:text-sm"
                  >
                    Confirmar →
                  </button>
                </div>
              </div>

              {/* Resumo à direita - DESKTOP ONLY */}
              <div className="hidden lg:flex lg:flex-col lg:w-80 bg-gray-50 border-l border-gray-200 shrink-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo</h3>
                  <div className="space-y-4">
                    {appointment.service_id && (
                      <div className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Serviço</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{services.find(s => s.id === appointment.service_id)?.name}</div>
                      </div>
                    )}
                    {appointment.service_id && (
                      <div className="flex justify-between items-center gap-4 py-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Valor</div>
                        <div className="text-right font-normal text-gray-400 text-sm">R$ {services.find(s => s.id === appointment.service_id)?.price}</div>
                      </div>
                    )}
                    {appointment.professional_id && (
                      <div className="flex justify-between items-center gap-4 py-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Profissional</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{professionals.find(p => p.id === appointment.professional_id)?.name}</div>
                      </div>
                    )}
                    {appointment.appointment_date && (
                      <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Data</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                      </div>
                    )}
                    {appointment.appointment_time && (
                      <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                        <div className="text-sm text-gray-500">Hora</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{appointment.appointment_time}</div>
                      </div>
                    )}
                    {(checkoutForm.firstName || checkoutForm.lastName) && (
                      <div className="flex justify-between items-start gap-4 pt-4">
                        <div className="text-sm text-gray-500">Dados cliente</div>
                        <div className="text-right font-semibold text-gray-900 text-sm">{`${checkoutForm.firstName}${checkoutForm.lastName ? ' ' + checkoutForm.lastName : ''}`.trim()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profissionais */}
      {showProfessionalsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col w-full h-[95vh] max-h-[95vh] overflow-hidden shrink-0 animate-in zoom-in-95 duration-300">
            {/* Progress bar - TOPO */}
            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 flex justify-start shrink-0">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-3 h-3 rounded-full transition-all ${
                      dot === 3 ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Conteúdo com sidebar - FLEX ROW em lg, COLUMN em mobile */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Sidebar esquerda - hidden em mobile */}
              <div className="hidden lg:flex w-56 bg-gray-100 flex-col items-center justify-center p-6 border-r border-gray-200 border-b lg:border-b-0 shrink-0">
                <div className="flex flex-col items-center gap-6">
                  {/* Checkmark */}
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* Texto */}
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    Qual profissional deseja escolher?
                  </p>
                </div>
              </div>

              {/* Conteúdo principal - NO MEIO - SCROLLÁVEL */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header mobile com sidebar info */}
                <div className="lg:hidden bg-gray-100 p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-semibold">Qual profissional deseja escolher?</p>
                  </div>
                </div>
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
                    <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Selecione um profissional</h2>
                    <button
                      onClick={() => {
                        router.push("/booking");
                      }}
                      className="p-0 h-auto text-gray-600 hover:text-gray-800 text-lg sm:text-xl shrink-0 bg-transparent border-0"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3 overflow-visible">
                    {professionals && professionals.length > 0 ? (
                      professionals.map((professional) => (
                        <div key={professional.id} className="overflow-visible">
                          <button
                            onClick={() => handleProfessionalSelect(professional)}
                            className={`w-full flex items-center gap-3 sm:gap-4 p-2 sm:p-4 rounded-lg sm:rounded-2xl border-2 transition-all duration-200 group hover:scale-105 origin-center ${
                              selectedProfessional?.id === professional.id 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 border-gray-300 overflow-hidden box-border">
                              {professional.imageUrl ? (
                                <Image 
                                  src={professional.imageUrl} 
                                  alt={professional.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-2xl">
                                  {professional.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg transition-transform duration-200 group-hover:scale-105 origin-left">{professional.name}</div>
                              {professional.position && (
                                <div className="text-xs sm:text-sm text-gray-500 mt-1 transition-transform duration-200 group-hover:scale-105 origin-left">{professional.position}</div>
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
                  </div>
                </div>

                {/* Botões do rodapé - MOBILE E DESKTOP */}
                <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-6 lg:p-8 space-y-3 lg:hidden">
                  <Button
                    onClick={() => {
                      setShowProfessionalsModal(false);
                      setShowServicesModal(true);
                    }}
                    variant="outline"
                    className="w-full text-sm sm:text-base"
                  >
                    ← Voltar
                  </Button>
                </div>
              </div>

              {/* Resumo à direita - FIXO */}
              <div className="w-80 bg-gray-50 border-l border-gray-200 hidden lg:flex flex-col shrink-0 overflow-hidden">
                {/* Conteúdo do resumo scrollável */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
                  <div className="space-y-0">
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
                    {!selectedService && !selectedProfessional && (
                      <div className="text-center text-gray-500 py-8">
                        Selecione um profissional
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Serviços */}
      {showViewServicesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full h-[95vh] max-h-[95vh] overflow-y-auto shrink-0">
            <div className="p-3 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Serviços Disponíveis</h2>
                <Button
                  onClick={() => {
                    router.push("/booking");
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-lg sm:text-xl shrink-0"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-6">
                {services && services.length > 0 ? (
                  Object.entries(groupServicesByCategory(services)).map(([category, categoryServices]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">{category}</h3>
                      <div className="space-y-3">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                              {service.imageUrl ? (
                                <Image 
                                  src={service.imageUrl} 
                                  alt={service.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                                  {service.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-gray-900 text-base lg:text-lg">{service.name}</div>
                              {service.description && (
                                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</div>
                              )}
                              {service.duration && (
                                <div className="text-xs text-gray-600 mt-2">{service.duration}</div>
                              )}
                              {service.price && <div className="text-base font-bold text-blue-600 mt-2">R$ {service.price}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">Nenhum serviço encontrado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Profissionais */}
      {showViewProfessionalsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full h-[95vh] max-h-[95vh] overflow-y-auto shrink-0">
            <div className="p-3 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-3 sm:mb-6 lg:mb-8">
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">Profissionais</h2>
                <Button
                  onClick={() => {
                    router.push("/booking");
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-lg sm:text-xl shrink-0"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-3">
                {professionals && professionals.length > 0 ? (
                  professionals.map((professional) => (
                    <div
                      key={professional.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                        {professional.imageUrl ? (
                          <Image 
                            src={professional.imageUrl} 
                            alt={professional.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                            {professional.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{professional.name}</div>
                        {professional.position && (
                          <div className="text-sm text-gray-600 mt-1">{professional.position}</div>
                        )}
                        {professional.department && (
                          <div className="text-sm text-gray-600">Departamento: {professional.department}</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">Nenhum profissional encontrado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Definir Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-60 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-xl p-4 sm:p-8">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Defina sua senha</h3>
            
            <input
              type="password"
              placeholder="Defina sua senha"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 sm:mb-6"
            />
            
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setShowSuccessModal(false);
                  setPasswordInput("");
                }}
                className="flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-full border-2 border-gray-300 text-gray-900 font-semibold text-sm sm:text-base hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Salvar senha (mockup)
                  setShowPasswordModal(false);
                  setShowSuccessModal(false);
                  setPasswordInput("");
                }}
                className="flex-1 bg-gray-900 text-white font-semibold py-2 sm:py-3 px-3 sm:px-6 rounded-full text-sm sm:text-base hover:bg-gray-800 transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sucesso com Modal Lateral */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2 animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row bg-white w-full h-screen lg:h-auto lg:max-h-[95vh] shadow-xl rounded-lg lg:rounded-3xl overflow-hidden">
            {/* Sidebar - hidden em mobile */}
            <div className="hidden lg:flex lg:w-80 bg-gray-100 flex-col overflow-y-auto shrink-0">
              <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className={`w-3 h-3 rounded-full transition-all ${step <= 5 ? "bg-blue-500" : "bg-gray-300"}`} />
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-300 rounded-full">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-400 rounded-full">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-600 text-sm leading-relaxed">
                  Seu compromisso foi agendado com sucesso. Guarde esta confirmação para seu controle.
                </p>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 overflow-y-auto bg-white relative">
              {successMessage.includes("sucesso") && appointmentData ? (
                <div className="p-3 lg:p-8">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      window.location.href = "/booking";
                    }}
                    className="fixed top-4 right-4 lg:absolute lg:top-8 lg:right-8 z-50 text-gray-600 hover:text-gray-800 text-2xl lg:text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                  
                  <div className="text-center mb-4 lg:mb-8 mt-6 lg:mt-0">
                    <div className="flex justify-center mb-3 lg:mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 lg:w-32 lg:h-32 bg-green-100 rounded-full">
                        <div className="inline-flex items-center justify-center w-12 h-12 lg:w-20 lg:h-20 bg-green-500 rounded-full shadow-lg">
                          <svg className="w-6 h-6 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-lg lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Agendamento confirmado</h2>
                    <p className="text-gray-500 text-sm lg:text-lg font-semibold mb-3 lg:mb-6">#{appointmentData.id}</p>
                    
                    <button className="text-blue-600 hover:text-blue-700 text-xs lg:text-base font-semibold flex items-center justify-center gap-2 mx-auto mb-6 lg:mb-12">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                      </svg>
                      Adicionar à agenda
                    </button>
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-2 lg:space-y-4 mb-6 lg:mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 pb-3 lg:pb-4 border-b border-gray-100">
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Data:</div>
                        <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.date}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Nome:</div>
                        <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.clientName}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 pb-3 lg:pb-4 border-b border-gray-100">
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Hora:</div>
                        <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.time}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Telefone:</div>
                        <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.phone}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 pb-3 lg:pb-4 border-b border-gray-100">
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Profissional:</div>
                        <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.professional}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Email:</div>
                        <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.email || "Seu email"}</div>
                      </div>
                    </div>
                    <div className="text-left pt-3 lg:pt-4">
                      <div className="text-xs text-gray-500 font-semibold mb-1">Serviço:</div>
                      <div className="text-gray-900 font-semibold text-xs lg:text-sm">{appointmentData.service}</div>
                    </div>
                  </div>

                  {/* Mensagem */}
                  {!passwordSaved && (
                    <div className="bg-blue-50 rounded-lg lg:rounded-2xl p-3 lg:p-4 mb-4 lg:mb-8">
                      <p className="text-xs lg:text-sm text-blue-700 leading-relaxed">
                        Seu agendamento está confirmado. Definindo uma senha agora você poderá agendar na próxima vez sem preencher os dados.
                      </p>
                    </div>
                  )}

                  {/* Formulário ou Botão */}
                  {!passwordSaved && (
                    <>
                      {showPasswordForm ? (
                        <div className="flex gap-2 lg:gap-3 mb-6 lg:mb-8">
                          <div className="flex-1 relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Defina sua senha"
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              className="w-full px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl border border-gray-200 text-xs lg:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3C5.58 3 2.238 5.957.333 10a13.364 13.364 0 001.858 3.573l1.534-1.534A9.964 9.964 0 015.07 9.66l1.428-1.428a4 4 0 015.664 5.664l1.429-1.429a9.964 9.964 0 00-1.428-2.536l1.534-1.534C17.762 14.043 20.957 10 10 3zm4.293 4.293a1 1 0 10-1.414 1.414A3 3 0 113 10a1 1 0 00-2 0 5 5 0 009.293-2.707z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setPasswordSaved(true);
                              setPasswordInput("");
                              setShowPasswordForm(false);
                              setShowPassword(false);
                            }}
                            className="bg-gray-900 text-white font-semibold py-2 lg:py-3 px-4 lg:px-8 rounded-lg lg:rounded-full hover:bg-gray-800 transition-all whitespace-nowrap text-xs lg:text-base"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowPasswordForm(true);
                          }}
                          className="w-full bg-gray-900 text-white font-semibold py-2 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-full hover:bg-gray-800 transition-all mb-6 lg:mb-8 text-xs lg:text-base"
                        >
                          Definir uma senha
                        </button>
                      )}
                    </>
                  )}

                  {passwordSaved && (
                    <div className="bg-gray-100 rounded-lg lg:rounded-2xl p-3 lg:p-4 mb-6 lg:mb-8">
                      <p className="text-center text-gray-900 font-semibold text-xs lg:text-sm leading-relaxed">
                        Ótimo, agora você pode gerenciar seus agendamentos na Área do Cliente
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 lg:p-8 text-center bg-white flex flex-col items-center justify-center h-full">
                  <h2 className="text-2xl lg:text-4xl mb-3 lg:mb-4">⚠️</h2>
                  <p className="text-gray-900 mb-4 lg:mb-6 text-xs lg:text-base leading-relaxed">{successMessage}</p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-gray-900 text-white font-semibold py-2 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-full hover:bg-gray-800 transition-all text-xs lg:text-base"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ChatPage;
