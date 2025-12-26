"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { BotMessageSquare, ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Streamdown } from "streamdown";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";

// Type definitions
interface Service {
  id: string;
  name: string;
  duration: string | number;
  price: number;
  imageUrl?: string;
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

const ChatPage = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getToken = async () => {
      try {
        // Tentar obter token se o usuário está autenticado
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          setToken(data.session.access_token);
        }
      } catch {
        // Continuar mesmo se não conseguir obter token
        console.log("Continuando sem autenticação");
      }
    };
    getToken();
  }, [supabase]);

  // Carregar dados do cliente do localStorage
  const [bookingUser, setBookingUser] = useState<{ name?: string; phone?: string } | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

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

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: async (input, init) => {
        // Adicionar bookingUser ao body
        if (init?.body && typeof init.body === "string") {
          const body = JSON.parse(init.body);
          return fetch(input, {
            ...init,
            body: JSON.stringify({ ...body, bookingUser }),
          });
        }
        return fetch(input, init);
      },
    }),
  });
  const [input, setInput] = useState("");
  // Estados para agendamento guiado por perguntas
  const [appointment, setAppointment] = useState({
    service_id: "",
    professional_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [awaitingInput, setAwaitingInput] = useState<string | null>(null);
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
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Barba",
      duration: "00:20:00",
      price: 40,
      imageUrl: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Pézinho",
      duration: "00:30:00",
      price: 35,
      imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Sobrancelha",
      duration: "00:15:00",
      price: 20,
      imageUrl: "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      name: "Massagem",
      duration: "00:45:00",
      price: 50,
      imageUrl: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      name: "Hidratação",
      duration: "00:30:00",
      price: 25,
      imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
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
    // Buscar serviços reais do banco
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name, duration, price");
        
        if (error) {
          console.error("Erro ao buscar serviços:", error);
          setServices(staticServices);
        } else if (data && data.length > 0) {
          console.log("Serviços encontrados no banco:", data);
          // Mapear os serviços do banco com as imagens estáticas
          const servicesWithData: Service[] = data.map((service, index: number) => {
            const staticService = staticServices[index % staticServices.length];
            return {
              id: String(service.id),
              name: String(service.name),
              price: typeof service.price === "number" ? service.price : staticService.price,
              duration: String(service.duration || staticService.duration),
              imageUrl: staticService.imageUrl,
            };
          });
          console.log("Serviços mapeados:", servicesWithData);
          setServices(servicesWithData);
        } else {
          console.log("Nenhum serviço encontrado no banco, usando estáticos");
          setServices(staticServices);
        }
      } catch (err) {
        console.error("Erro na query de serviços:", err);
        setServices(staticServices);
      }
    };

    // Buscar profissionais reais do banco
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, name, position, department");
        
        if (error) {
          console.error("Erro ao buscar profissionais:", error);
          setProfessionals(staticProfessionals);
        } else if (data && data.length > 0) {
          console.log("Profissionais encontrados no banco:", data);
          // Mapear os profissionais do banco com as imagens estáticas
          const professionalsWithImages: Professional[] = data.map((prof, index: number) => ({
            id: String(prof.id),
            name: String(prof.name),
            position: prof.position ? String(prof.position) : undefined,
            department: prof.department ? String(prof.department) : undefined,
            imageUrl: staticProfessionals[index % staticProfessionals.length].imageUrl,
          }));
          console.log("Profissionais mapeados:", professionalsWithImages);
          setProfessionals(professionalsWithImages);
        } else {
          console.log("Nenhum profissional encontrado no banco, usando estáticos");
          setProfessionals(staticProfessionals);
        }
      } catch (err) {
        console.error("Erro na query de profissionais:", err);
        setProfessionals(staticProfessionals);
      }
    };

    fetchServices();
    fetchProfessionals();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estados das opções interativas
  const [hasInitiated, setHasInitiated] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showViewServicesModal, setShowViewServicesModal] = useState(false);
  const [showProfessionalsModal, setShowProfessionalsModal] = useState(false);
  const [showViewProfessionalsModal, setShowViewProfessionalsModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  // Inicia o fluxo de perguntas ao abrir o chat
  useEffect(() => {
    if (!hasInitiated && messages.length === 0) {
      setHasInitiated(true);
      setShowMenuModal(true);
      sendMessage({ 
        text: "Olá! 👋 Bem-vindo ao Agenda.ai\n\nComo posso ajudá-lo?"
      });
    }
    // eslint-disable-next-line
  }, [hasInitiated]);

  // Fechar modal quando opção for selecionada
  const handleMenuOption = (optionId: string) => {
    setShowMenuModal(false);
    
    if (optionId === "agendar") {
      startBooking();
    } else if (optionId === "servicos") {
      handleShowServices();
    } else if (optionId === "profissionais") {
      handleShowProfessionals();
    }
  };

  // Iniciar agendamento
  const startBooking = () => {
    setMessageOptions({});
    setShowServicesModal(true);
    setAwaitingInput("service");
  };

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

  // Lidar com seleção de profissional
  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowProfessionalsModal(false);
    setAppointment(prev => ({ ...prev, professional_id: professional.id }));
    setShowDateModal(true);
    setAwaitingInput("date");
  };

  // Gerar datas disponíveis (próximos 14 dias)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('pt-BR');
      dates.push({
        value: date.toISOString().split('T')[0],
        display: `${dayName}, ${dateStr}`
      });
    }
    return dates;
  };

  // Lidar com seleção de data
  const handleDateSelect = (dateValue: string) => {
    setAppointment(prev => ({ ...prev, appointment_date: dateValue }));
    setShowDateModal(false);
    setShowTimeModal(true);
    setAwaitingInput("time");
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

  // Lidar com seleção de horário
  const handleTimeSelect = (timeValue: string) => {
    const finalAppointment = {
      ...appointment,
      appointment_time: timeValue
    };
    
    setAppointment(finalAppointment);
    setShowTimeModal(false);
    
    // Formatar data para o padrão brasileiro
    const dateParts = finalAppointment.appointment_date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    
    const resumoMsg = `📋 **Resumo do agendamento:**\n\n✂️ Serviço: ${selectedService?.name}\n👨‍💼 Profissional: ${selectedProfessional?.name}\n📅 Data: ${formattedDate}\n🕐 Horário: ${timeValue}\n\nConfirmando agendamento...`;
    
    sendMessage({ text: resumoMsg });
    
    // Salvar o agendamento com os dados completos
    setTimeout(() => {
      saveAppointment(finalAppointment);
    }, 500);
  };

  // Listar profissionais
  const handleShowProfessionals = async () => {
    if (professionals && professionals.length > 0) {
      setShowViewProfessionalsModal(true);
    } else {
      sendMessage({ text: "Nenhum profissional encontrado." });
    }
  };

  // Voltar ao menu
  const handleBackToMenu = () => {
    sendMessage({ 
      text: "O que deseja fazer?"
    });
    setShowMenuModal(true);
  };

  // Salvar agendamento no Supabase
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
        setShowSuccessModal(true);
        // Buscar nomes dos serviços e profissionais selecionados
        const servico = services.find(s => s.id === appointment.service_id)?.name || "";
        const profissional = professionals.find(p => p.id === appointment.professional_id)?.name || "";
        // Formatar data para padrão brasileiro
        let dataFormatada = "";
        if (appointment.appointment_date) {
          // Esperado: yyyy-mm-dd
          const partes = appointment.appointment_date.split("-");
          if (partes.length === 3) {
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
          } else {
            dataFormatada = appointment.appointment_date;
          }
        }
        const resumo = `Resumo do agendamento:\nServiço: ${servico}\nProfissional: ${profissional}\nData: ${dataFormatada}\nHorário: ${appointment.appointment_time}`;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Fluxo de perguntas
    if (awaitingInput === "service") {
      // Buscar serviço pelo nome
      const servico = services.find(s => s.name.toLowerCase() === input.trim().toLowerCase());
      if (servico) {
        setAppointment(a => ({ ...a, service_id: servico.id }));
        sendMessage({ text: `Serviço: ${servico.name}` });
        setAwaitingInput("professional");
        
        const msgId = Date.now().toString();
        const opcoesProfs = professionals.map(p => ({ id: p.id, label: p.name }));
        sendMessage({ 
          text: "Qual profissional você deseja?"
        });
        setMessageOptions(prev => ({
          ...prev,
          [msgId]: opcoesProfs
        }));
      } else {
        sendMessage({ text: "Serviço não encontrado. Por favor, digite novamente." });
      }
      setInput("");
      return;
    }
    if (awaitingInput === "professional") {
      const profissional = professionals.find(p => p.name.toLowerCase() === input.trim().toLowerCase());
      if (profissional) {
        setAppointment(a => ({ ...a, professional_id: profissional.id }));
        sendMessage({ text: `Profissional: ${profissional.name}` });
        setAwaitingInput("date");
        sendMessage({ text: "Qual data deseja agendar? (dd/mm/aaaa)" });
      } else {
        const lista = professionals.map(p => `- ${p.name}`).join("\n");
        sendMessage({ text: `Profissional não encontrado.\nProfissionais disponíveis:\n${lista}\nPor favor, digite o nome de um profissional da lista.` });
      }
      setInput("");
      return;
    }
    if (awaitingInput === "date") {
      // Valida formato dd/mm/aaaa
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (regex.test(input.trim())) {
        const [dia, mes, ano] = input.trim().split("/");
        setAppointment(a => ({ ...a, appointment_date: `${ano}-${mes}-${dia}` }));
        sendMessage({ text: `Data: ${input.trim()}` });
        setAwaitingInput("time");
        sendMessage({ text: "Qual horário deseja? (hh:mm)" });
      } else {
        sendMessage({ text: "Formato de data inválido. Use dd/mm/aaaa." });
      }
      setInput("");
      return;
    }
    if (awaitingInput === "time") {
      // Valida formato hh:mm
      const regex = /^([01]?\d|2[0-3]):[0-5]\d$/;
      if (regex.test(input.trim())) {
        setAppointment(a => ({ ...a, appointment_time: input.trim() }));
        sendMessage({ text: `Horário: ${input.trim()}` });
        setAwaitingInput("confirm");
        
        // Buscar nomes dos serviços e profissionais selecionados
        const servico = services.find(s => s.id === appointment.service_id)?.name || "";
        const profissional = professionals.find(p => p.id === appointment.professional_id)?.name || "";
        const msgId = Date.now().toString();
        
        sendMessage({ 
          text: `Confirmar agendamento?\n\nServiço: ${servico}\nProfissional: ${profissional}\nData: ${appointment.appointment_date}\nHorário: ${input.trim()}`
        });
        setMessageOptions(prev => ({
          ...prev,
          [msgId]: [
            { id: "confirmar", label: "✅ Confirmar" },
            { id: "cancelar", label: "❌ Cancelar" }
          ]
        }));
      } else {
        sendMessage({ text: "Formato de horário inválido. Use hh:mm." });
      }
      setInput("");
      return;
    }
    if (awaitingInput === "confirm") {
      if (input.trim().toLowerCase() === "sim" || input.trim().toLowerCase() === "confirmar" || input === "✅ Confirmar") {
        saveAppointment();
        setAwaitingInput(null);
      } else {
        sendMessage({ text: "Agendamento cancelado." });
        setAwaitingInput(null);
        setAppointment({ service_id: "", professional_id: "", appointment_date: "", appointment_time: "" });
        handleBackToMenu();
      }
      setInput("");
      return;
    }

    // Processar opções de menu
    if (input.includes("agendar") || input === "📅 Agendar" || input === "📅 Agendar agora") {
      startBooking();
      setInput("");
      return;
    }
    if (input.includes("servicos") || input === "✂️ Serviços") {
      handleShowServices();
      setInput("");
      return;
    }
    if (input.includes("profissionais") || input === "👨‍💼 Profissionais") {
      handleShowProfessionals();
      setInput("");
      return;
    }
    if (input.includes("voltar") || input === "🏠 Voltar") {
      handleBackToMenu();
      setInput("");
      return;
    }

    // Mensagem normal
    if (status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const isLoading = status === "submitted" || status === "streaming" || loading;

  function handleConfirmBooking() {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/booking">
          <Button variant="ghost" size="icon" className="size-6">
            <ChevronLeft className="size-6" />
          </Button>
        </Link>
        <h1 className="font-(family-name:--font-merriweather) text-xl tracking-tight italic">
          Agenda.ai
        </h1>
        <div className="size-6" />
      </header>

      {/* Status Message */}
      <div className="px-5 pt-6">
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground text-center text-sm">
            Seu assistente de agendamentos está online. Você pode agendar sem fazer login!
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Chat Messages */}
        {messages.map((message, index: number) => {
          const options = messageOptions[message.id] || [];
          return (
            <div key={message.id} className="pt-6">
              {message.role === "assistant" ? (
                <div className="flex items-start gap-2 px-3 pr-14">
                  <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border">
                    <BotMessageSquare className="text-primary size-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                      {message.parts?.map((part, partIndex: number) =>
                        part.type === "text" && 'text' in part ? (
                          <Streamdown key={partIndex}>{(part as { type: string; text: string }).text}</Streamdown>
                        ) : null,
                      )}
                    </div>
                    
                    {/* Quick Reply Buttons - mostrar apenas para última mensagem do bot */}
                    {index === messages.length - 1 && message.role === "assistant" && options.length > 0 && (
                      <div className="mt-3 space-y-2 w-full">
                        {options.map((option: { id: string; label: string }) => (
                          <Button
                            key={option.id}
                            onClick={() => {
                              setInput(option.label);
                              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                            }}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-2 px-3 font-normal"
                            disabled={isLoading}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pr-5 pl-10">
                  <div className="bg-secondary rounded-full px-4 py-3">
                    <p className="text-sm">
                      {message.parts?.map((part, partIndex: number) =>
                        part.type === "text" && "text" in part ? (
                          <span key={partIndex}>{part.text as string}</span>
                        ) : null,
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 px-3 pt-6 pr-14">
            <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border">
              <BotMessageSquare className="text-primary size-3.5" />
            </div>
            <div className="text-muted-foreground text-sm">Digitando...</div>
          </div>
        )}
      </div>

      {/* Modal Menu */}
      {showMenuModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Opções</h2>
            <div className="space-y-3">
              <button
                onClick={() => handleMenuOption("agendar")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
              >
                📅 Agendar
              </button>
              <button
                onClick={() => handleMenuOption("servicos")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
              >
                ✂️ Serviços
              </button>
              <button
                onClick={() => handleMenuOption("profissionais")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
              >
                👨‍💼 Profissionais
              </button>
              <button
                onClick={() => router.push("/booking")}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Serviços */}
      {showServicesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh]">
            {/* Serviços à esquerda/topo */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Se desejam, adicionem mais serviços</h2>
                <Button
                  onClick={() => {
                    setShowServicesModal(false);
                    setShowMenuModal(true);
                    setAwaitingInput(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl shrink-0"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group ${
                      selectedService?.id === service.id 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
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
                      <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{service.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{service.duration}</div>
                      {service.price && <div className="text-base font-bold text-blue-600 mt-2">R$ {service.price}</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resumo à direita/bottom */}
            <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
              <div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Resumo</h3>
                <div className="space-y-4">
                  {selectedService && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Serviço</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedService.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedService.duration}</div>
                      <div className="text-lg font-bold text-blue-600 mt-2">R$ {selectedService.price}</div>
                    </div>
                  )}
                  {!selectedService && (
                    <div className="text-center text-gray-500 py-8">
                      Selecione um serviço
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
                <Button
                  onClick={() => {
                    setShowServicesModal(false);
                    setShowMenuModal(true);
                    setAwaitingInput(null);
                  }}
                  variant="outline"
                  className="w-full text-sm lg:text-base"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedService) {
                      setShowServicesModal(false);
                      setShowProfessionalsModal(true);
                    }
                  }}
                  disabled={!selectedService}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm lg:text-base"
                >
                  Próximo passo →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Data */}
      {showDateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh]">
            {/* Datas à esquerda/topo */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">📅 Escolha a data</h2>
                <Button
                  onClick={() => {
                    setShowDateModal(false);
                    setShowMenuModal(true);
                    setAwaitingInput(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-2">
                {getAvailableDates().map((date) => (
                  <button
                    key={date.value}
                    onClick={() => handleDateSelect(date.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 font-medium ${
                      appointment.appointment_date === date.value
                        ? 'border-blue-400 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    {date.display}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumo à direita/bottom */}
            <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
                <div className="space-y-4">
                  {selectedService && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Serviço</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedService.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedService.duration}</div>
                      <div className="text-lg font-bold text-blue-600 mt-2">R$ {selectedService.price}</div>
                    </div>
                  )}
                  {selectedProfessional && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Profissional</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedProfessional.name}</div>
                    </div>
                  )}
                  {appointment.appointment_date && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Data</div>
                      <div className="font-semibold text-gray-900 text-lg">{appointment.appointment_date}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowDateModal(false);
                    setShowProfessionalsModal(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={() => {
                    if (appointment.appointment_date) {
                      setShowDateModal(false);
                      setShowTimeModal(true);
                    }
                  }}
                  disabled={!appointment.appointment_date}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Próximo passo →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Horário */}
      {showTimeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh]">
            {/* Horários à esquerda/topo */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">🕐 Escolha o horário</h2>
                <Button
                  onClick={() => {
                    setShowTimeModal(false);
                    setShowMenuModal(true);
                    setAwaitingInput(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl"
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {getAvailableTimes().map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 rounded-lg border transition-all duration-200 font-medium text-sm ${
                      appointment.appointment_time === time
                        ? 'border-blue-400 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumo à direita/bottom */}
            <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
                <div className="space-y-4">
                  {selectedService && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Serviço</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedService.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedService.duration}</div>
                      <div className="text-lg font-bold text-blue-600 mt-2">R$ {selectedService.price}</div>
                    </div>
                  )}
                  {selectedProfessional && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Profissional</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedProfessional.name}</div>
                    </div>
                  )}
                  {appointment.appointment_date && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Data</div>
                      <div className="font-semibold text-gray-900 text-lg">{appointment.appointment_date}</div>
                    </div>
                  )}
                  {appointment.appointment_time && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Horário</div>
                      <div className="font-semibold text-gray-900 text-lg">{appointment.appointment_time}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowTimeModal(false);
                    setShowDateModal(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={() => {
                    if (appointment.appointment_time) {
                      handleConfirmBooking();
                    }
                  }}
                  disabled={!appointment.appointment_time}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Confirmar →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profissionais */}
      {showProfessionalsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh]">
            {/* Profissionais à esquerda/topo */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">👨‍💼 Profissionais</h2>
                <Button
                  onClick={() => {
                    setShowProfessionalsModal(false);
                    setShowMenuModal(true);
                    setAwaitingInput(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-3">
                {professionals && professionals.length > 0 ? (
                  professionals.map((professional) => (
                    <button
                      key={professional.id}
                      onClick={() => handleProfessionalSelect(professional)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group ${
                        selectedProfessional?.id === professional.id 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="shrink-0 w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden box-border">
                        {professional.imageUrl ? (
                          <Image 
                            src={professional.imageUrl} 
                            alt={professional.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                            {professional.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 text-lg">{professional.name}</div>
                        {professional.position && (
                          <div className="text-sm text-gray-600 mt-1">{professional.position}</div>
                        )}
                        {professional.department && (
                          <div className="text-xs text-gray-500 mt-1">{professional.department}</div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">Nenhum profissional encontrado</div>
                )}
              </div>
            </div>

            {/* Resumo à direita/bottom */}
            <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
                <div className="space-y-4">
                  {selectedService && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Serviço</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedService.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedService.duration}</div>
                      <div className="text-lg font-bold text-blue-600 mt-2">R$ {selectedService.price}</div>
                    </div>
                  )}
                  {selectedProfessional && (
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Profissional</div>
                      <div className="font-semibold text-gray-900 text-lg">{selectedProfessional.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedProfessional.position}</div>
                    </div>
                  )}
                  {!selectedService && !selectedProfessional && (
                    <div className="text-center text-gray-500 py-8">
                      Selecionando...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowProfessionalsModal(false);
                    setShowServicesModal(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ← Voltar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedProfessional) {
                      setShowProfessionalsModal(false);
                      setShowDateModal(true);
                    }
                  }}
                  disabled={!selectedProfessional}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Próximo passo →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Serviços */}
      {showViewServicesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Serviços Disponíveis</h2>
                <Button
                  onClick={() => {
                    setShowViewServicesModal(false);
                    setShowMenuModal(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl shrink-0"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-3">
                {services && services.length > 0 ? (
                  services.map((service) => (
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
                        <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{service.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{service.duration}</div>
                        {service.price && <div className="text-base font-bold text-blue-600 mt-2">R$ {service.price}</div>}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Profissionais</h2>
                <Button
                  onClick={() => {
                    setShowViewProfessionalsModal(false);
                    setShowMenuModal(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl shrink-0"
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

      {/* Modal Sucesso/Erro */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
            <h2 className="text-4xl mb-4">{successMessage.includes("sucesso") ? "✅" : "⚠️"}</h2>
            <p className="text-gray-900 mb-6 text-base leading-relaxed">{successMessage}</p>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (successMessage.includes("sucesso")) {
                  setShowMenuModal(true);
                }
              }}
              className="w-full"
            >
              {successMessage.includes("sucesso") ? "Voltar ao Menu" : "Fechar"}
            </Button>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="bg-muted fixed right-0 bottom-0 left-0 p-5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem"
            disabled={isLoading}
            className="flex-1 bg-background text-foreground placeholder:text-muted-foreground rounded-full px-4 py-3 text-sm outline-none"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-1 size-10.5 shrink-0 rounded-full"
          >
            <Send className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
