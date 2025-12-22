import { streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClient } from "@/utils/supabase/server"
import { z } from "zod"
import {
  createAppointment,
  getAvailableTimeSlots,
  getServices,
  getProfessionals,
  getCustomerInfo,
} from "@/actions/create-appointment"

export async function POST(req: Request) {
  try {
    const { messages, bookingUser } = await req.json()

    const supabase = await createClient()
    
    // Tentar obter o usuário autenticado, mas não é obrigatório
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let customer = null;
    let customerId = "guest";
    let guestName = bookingUser?.name;
    let guestPhone = bookingUser?.phone;

    // Se o usuário está autenticado, tenta buscar seus dados de cliente
    if (user) {
      const { data: customerData } = await supabase
        .from("customers")
        .select("id, name, phone")
        .eq("auth_id", user.id)
        .single();

      if (customerData) {
        customer = customerData;
        customerId = customerData.id;
      }
    }

    const customerName = customer?.name || guestName || "Visitante";

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `Você é o Agenda.ai, um assistente amigável de agendamento de barbearias. 
      Ajude os usuários a encontrar barbearias, ver serviços disponíveis e fazer agendamentos.
      Seja conciso e amigável. Responda em português brasileiro.
      
      ${customer ? `O usuário logado é: ${customer.name} (${customer.phone})` : guestName ? `Visitante identificado como: ${guestName} (${guestPhone})` : "Você está conversando com um visitante não autenticado."}
      
      Use as ferramentas disponíveis para:
      1. Listar serviços disponíveis com listServices
      2. Listar profissionais com listProfessionals
      3. Verificar horários disponíveis com checkAvailableTimeSlots
      4. Criar agendamentos com createAppointmentTool
      
      IMPORTANTE PARA AGENDAMENTOS:
      ${guestName && guestPhone ? `- O cliente é: ${guestName}, Telefone: ${guestPhone}` : "- SEMPRE peça ao usuário seu NOME antes de confirmar o agendamento (a menos que ele já esteja autenticado)"}
      ${!guestPhone && !customer ? "- SEMPRE peça TELEFONE se for um visitante não autenticado" : ""}
      - SEMPRE peça confirmação de todos os detalhes antes de criar o agendamento
      - OBRIGATORIAMENTE, use o createAppointmentTool passando:
        * serviceId: ID do serviço (OBRIGATÓRIO - sempre inclua, nunca deixe vazio)
        * appointmentDate: Data no formato YYYY-MM-DD (OBRIGATÓRIO)
        * appointmentTime: Horário no formato HH:mm (OBRIGATÓRIO)
        * professionalId: ID do profissional (OBRIGATÓRIO - sempre inclua)
        * customerName: Nome do cliente (OBRIGATÓRIO se não autenticado)
        * customerPhone: Telefone do cliente (OBRIGATÓRIO se não autenticado)
      
      FLUXO OBRIGATÓRIO:
      1. Primeiro, SEMPRE liste os serviços com listServices
      2. Deixe o usuário escolher um serviço (pegue o ID)
      3. SEMPRE liste os profissionais com listProfessionals
      4. Deixe o usuário escolher um profissional (pegue o ID)
      5. Deixe o usuário escolher uma data
      6. Verifique horários com checkAvailableTimeSlots
      7. SOMENTE DEPOIS de todos esses dados, confirme com o usuário
      8. Chame createAppointmentTool com TODOS os campos preenchidos
      
      Responda de forma clara os dados que vai usar no agendamento.`,
      messages,
      tools: {
        listServices: tool({
          description: "Lista todos os serviços disponíveis",
          inputSchema: z.object({}),
          execute: async () => {
            const result = await getServices();
            return result;
          },
        }),
        listProfessionals: tool({
          description: "Lista todos os profissionais disponíveis",
          inputSchema: z.object({}),
          execute: async () => {
            const result = await getProfessionals();
            return result;
          },
        }),
        checkAvailableTimeSlots: tool({
          description: "Verifica horários disponíveis para uma data e serviço específicos",
          inputSchema: z.object({
            serviceId: z.string().describe("ID do serviço"),
            appointmentDate: z.string().describe("Data do agendamento (YYYY-MM-DD)"),
            professionalId: z.string().optional().describe("ID do profissional (opcional)"),
          }),
          execute: async (input: { serviceId: string; appointmentDate: string; professionalId?: string }) => {
            const result = await getAvailableTimeSlots(
              input.serviceId,
              input.appointmentDate,
              input.professionalId
            );
            return result;
          },
        }),
        createAppointmentTool: tool({
          description: "Cria um novo agendamento. Requer nome e telefone do cliente se não autenticado.",
          inputSchema: z.object({
            serviceId: z.string().describe("ID do serviço"),
            appointmentDate: z.string().describe("Data do agendamento (YYYY-MM-DD)"),
            appointmentTime: z.string().describe("Horário do agendamento (HH:mm)"),
            professionalId: z.string().optional().describe("ID do profissional (opcional)"),
            customerName: z.string().optional().describe("Nome do cliente (obrigatório se não autenticado)"),
            customerPhone: z.string().optional().describe("Telefone do cliente (obrigatório se não autenticado)"),
          }),
          execute: async (input: {
            serviceId: string;
            appointmentDate: string;
            appointmentTime: string;
            professionalId?: string;
            customerName?: string;
            customerPhone?: string;
          }) => {
            // Se não autenticado, tentar criar/encontrar cliente
            let finalCustomerId = customerId;

            if (customerId === "guest") {
              // Usar dados do guest (do localStorage) se disponíveis, caso contrário pedir ao usuário
              const name = input.customerName || guestName || "Cliente";
              const phone = input.customerPhone || guestPhone || `temp_${Date.now()}`;

              if (!phone || !name) {
                return {
                  success: false,
                  error: "Para agendamentos, nome e telefone são obrigatórios",
                };
              }

              // Tentar encontrar cliente pelo telefone (que é UNIQUE)
              const { data: existingCustomer, error: findError } = await supabase
                .from("customers")
                .select("id")
                .eq("phone", phone)
                .single();

              if (existingCustomer) {
                finalCustomerId = existingCustomer.id;
              } else {
                // Criar novo cliente sem autenticação
                const { data: newCustomer, error: createError } = await supabase
                  .from("customers")
                  .insert({
                    name: name,
                    phone: phone,
                  })
                  .select()
                  .single();

                if (createError || !newCustomer) {
                  return {
                    success: false,
                    error: `Erro ao criar perfil: ${createError?.message || "Cliente não foi retornado"}`,
                  };
                }

                finalCustomerId = newCustomer.id;
              }
            }

            const result = await createAppointment({
              customerId: finalCustomerId,
              serviceId: input.serviceId,
              appointmentDate: input.appointmentDate,
              appointmentTime: input.appointmentTime,
              professionalId: input.professionalId,
              status: "pending",
            });
            
            // Retornar resposta com customerId incluído para referência
            return {
              ...result,
              customerId: finalCustomerId,
            };
          },
        }),
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    return new Response("Erro ao processar mensagem", { status: 500 })
  }
}
