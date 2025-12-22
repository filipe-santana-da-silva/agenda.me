"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { BotMessageSquare, ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Streamdown } from "streamdown";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";

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
      } catch (err) {
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
            .catch(err => {});
        }
      }
    } catch (err) {
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
  const [step, setStep] = useState<string | null>(null);
  const [appointment, setAppointment] = useState({
    service_id: "",
    professional_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [awaitingInput, setAwaitingInput] = useState<string | null>(null);
  const [messageOptions, setMessageOptions] = useState<Record<string, Array<{ id: string; label: string }>>>({});

  // Buscar serviços e profissionais reais do Supabase
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    // Buscar serviços com todos os campos
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.from("services").select("id, name, duration, price");
        if (error) {
          console.error("Erro ao buscar serviços:", error);
        } else {
          console.log("Serviços carregados:", data);
          if (data) setServices(data);
        }
      } catch (err) {
        console.error("Erro na query de serviços:", err);
      }
    };

    // Buscar profissionais com todos os campos
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase.from("employees").select("id, name, position, department");
        if (error) {
          console.error("Erro ao buscar profissionais:", error);
        } else {
          console.log("Profissionais carregados:", data);
          if (data) setProfessionals(data);
        }
      } catch (err) {
        console.error("Erro na query de profissionais:", err);
      }
    };

    fetchServices();
    fetchProfessionals();
  }, []);

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
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);

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
    setStep("service");
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
  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setShowServicesModal(false);
    setAppointment(prev => ({ ...prev, service_id: service.id }));
    setShowProfessionalsModal(true);
    setStep("professional");
    setAwaitingInput("professional");
  };

  // Lidar com seleção de profissional
  const handleProfessionalSelect = (professional: any) => {
    setSelectedProfessional(professional);
    setShowProfessionalsModal(false);
    setAppointment(prev => ({ ...prev, professional_id: professional.id }));
    setShowDateModal(true);
    setStep("date");
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
    setStep("time");
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

  // Adiciona mensagem ao chat simulando WhatsApp
  const addChatMessage = (text: string) => {
    sendMessage({ text });
  };

  // Salvar agendamento no Supabase
  const saveAppointment = async (appointmentData?: any) => {
    setLoading(true);
    try {
      // Usar dados passados ou valores do estado
      const finalAppointment = appointmentData || appointment;
      
      // Validação dos campos obrigatórios
      if (!finalAppointment.service_id || !finalAppointment.professional_id || !finalAppointment.appointment_date || !finalAppointment.appointment_time) {
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
        setStep(null);
        setAppointment({ service_id: "", professional_id: "", appointment_date: "", appointment_time: "" });
      } else {
        // Mostra mensagem detalhada do erro
        setSuccessMessage("Erro ao agendar: " + (result.error || "Tente novamente."));
        setShowSuccessModal(true);
      }
    } catch (error) {
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
        setStep("professional");
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
        setStep("date");
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
        setStep("time");
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
        setStep("confirm");
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
        setStep(null);
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
        {messages.map((message: any, index: number) => {
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
                      {message.parts?.map((part: any, partIndex: number) =>
                        part.type === "text" ? (
                          <Streamdown key={partIndex}>{part.text}</Streamdown>
                        ) : null,
                      )}
                    </div>
                    
                    {/* Quick Reply Buttons - mostrar apenas para última mensagem do bot */}
                    {index === messages.length - 1 && message.role === "assistant" && options.length > 0 && (
                      <div className="mt-3 space-y-2 w-full">
                        {options.map((option: any) => (
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
                      {message.parts?.map((part: any, partIndex: number) =>
                        part.type === "text" ? (
                          <span key={partIndex}>{part.text}</span>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-6">Opções</h2>
            <div className="space-y-3">
              <Button
                onClick={() => handleMenuOption("agendar")}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal"
              >
                📅 Agendar
              </Button>
              <Button
                onClick={() => handleMenuOption("servicos")}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal"
              >
                ✂️ Serviços
              </Button>
              <Button
                onClick={() => handleMenuOption("profissionais")}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal"
              >
                👨‍💼 Profissionais
              </Button>
              <Button
                onClick={() => router.push("/booking")}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal"
              >
                ← Voltar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Serviços */}
      {showServicesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">✂️ Serviços</h2>
              <Button
                onClick={() => {
                  setShowServicesModal(false);
                  setShowMenuModal(true);
                  setStep(null);
                  setAwaitingInput(null);
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {services.map((service) => (
                <Button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal flex-col items-start"
                >
                  <span className="font-semibold">{service.name}</span>
                  {service.price && <span className="text-sm text-muted-foreground">R$ {service.price}</span>}
                  {service.duration && <span className="text-xs text-muted-foreground mt-1">{service.duration}</span>}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Data */}
      {showDateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">📅 Escolha a data</h2>
              <Button
                onClick={() => {
                  setShowDateModal(false);
                  setShowServicesModal(true);
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {getAvailableDates().map((date) => (
                <Button
                  key={date.value}
                  onClick={() => handleDateSelect(date.value)}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal"
                >
                  {date.display}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Horário */}
      {showTimeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">🕐 Escolha o horário</h2>
              <Button
                onClick={() => {
                  setShowTimeModal(false);
                  setShowDateModal(true);
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getAvailableTimes().map((time) => (
                <Button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  variant="outline"
                  className="h-auto py-2 px-3 text-sm font-normal"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Profissionais */}
      {showProfessionalsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">👨‍💼 Profissionais</h2>
              <Button
                onClick={() => {
                  setShowProfessionalsModal(false);
                  setShowDateModal(true);
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {professionals && professionals.length > 0 ? (
                professionals.map((professional) => (
                  <Button
                    key={professional.id}
                    onClick={() => handleProfessionalSelect(professional)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 text-base font-normal flex-col items-start"
                  >
                    <span className="font-semibold">{professional.name}</span>
                    {professional.position && <span className="text-sm text-muted-foreground">{professional.position}</span>}
                    {professional.department && <span className="text-xs text-muted-foreground">{professional.department}</span>}
                  </Button>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">Nenhum profissional encontrado</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Serviços */}
      {showViewServicesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold"> Serviços Disponíveis</h2>
              <Button
                onClick={() => {
                  setShowViewServicesModal(false);
                  setShowMenuModal(true);
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {services && services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="font-semibold text-base">{service.name}</div>
                    {service.duration && (
                      <div className="text-sm text-muted-foreground mt-1">Duração: {service.duration}</div>
                    )}
                    {service.price && (
                      <div className="text-sm font-semibold text-primary mt-2">R$ {service.price}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">Nenhum serviço encontrado</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar Profissionais */}
      {showViewProfessionalsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">👨‍💼 Profissionais</h2>
              <Button
                onClick={() => {
                  setShowViewProfessionalsModal(false);
                  setShowMenuModal(true);
                }}
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
              >
                <ChevronLeft className="size-5" />
              </Button>
            </div>
            <div className="space-y-3">
              {professionals && professionals.length > 0 ? (
                professionals.map((professional) => (
                  <div
                    key={professional.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="font-semibold text-base">{professional.name}</div>
                    {professional.position && (
                      <div className="text-sm text-muted-foreground mt-1">Cargo: {professional.position}</div>
                    )}
                    {professional.department && (
                      <div className="text-sm text-muted-foreground">Departamento: {professional.department}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">Nenhum profissional encontrado</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sucesso/Erro */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">{successMessage.includes("sucesso") ? "✅" : "⚠️"}</h2>
            <p className="text-foreground mb-6">{successMessage}</p>
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
