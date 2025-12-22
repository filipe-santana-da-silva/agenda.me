"use server";

import { z } from "zod";
import { protectedActionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { createClient } from "@/utils/supabase/server";
import { isFuture } from "date-fns";
import { revalidatePath } from "next/cache";

const inputSchema = z.object({
  serviceId: z.string().uuid("ID do serviço inválido"),
  date: z.date("Data deve ser um objeto Date"),
  barbershopId: z.string().uuid("ID da barbearia inválido"),
  professionalId: z.string().uuid("ID do profissional inválido").optional(),
});

export type CreateBookingInput = z.infer<typeof inputSchema>;

export type AppointmentResponse = {
  id: string;
  customer_id: string;
  service_id: string;
  professional_id: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export const createBooking = protectedActionClient
  .inputSchema(inputSchema)
  .action(
    async ({ parsedInput: { serviceId, date, barbershopId, professionalId }, ctx: { user } }) => {
      const supabase = await createClient();

      // Validar se a data não é passada
      if (!isFuture(date)) {
        returnValidationErrors(inputSchema, {
          date: { _errors: ["A data não pode ser no passado"] },
        });
      }

      // Verificar se o serviço existe
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("id, price_in_cents")
        .eq("id", serviceId)
        .single();

      if (serviceError || !service) {
        returnValidationErrors(inputSchema, {
          serviceId: { _errors: ["Serviço não encontrado"] },
        });
      }

      // Verificar se a barbearia existe
      const { data: barbershop, error: barbershopError } = await supabase
        .from("barbershop")
        .select("id")
        .eq("id", barbershopId)
        .single();

      if (barbershopError || !barbershop) {
        returnValidationErrors(inputSchema, {
          barbershopId: { _errors: ["Barbearia não encontrada"] },
        });
      }

      // Obter ou criar customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      let customerId = customer?.id;

      if (!customer && !customerError) {
        // Criar novo customer
        const { data: newCustomer, error: createCustomerError } = await supabase
          .from("customers")
          .insert({
            auth_id: user.id,
            name: user.user_metadata?.name || "Customer",
            email: user.email || "",
          })
          .select("id")
          .single();

        if (createCustomerError || !newCustomer) {
          return {
            success: false,
            error: "Erro ao criar perfil do cliente. Tente novamente.",
          };
        }

        customerId = newCustomer.id;
      }

      // Extrair data e hora
      const appointmentDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const appointmentTime = date.toTimeString().split(" ")[0].substring(0, 5); // HH:MM

      // Validar se o horário não está ocupado
      const { data: existingAppointment, error: checkError } = await supabase
        .from("appointments")
        .select("id")
        .eq("service_id", serviceId)
        .eq("appointment_date", appointmentDate)
        .eq("appointment_time", appointmentTime)
        .in("status", ["pending", "confirmed"])
        .single();

      // Se encontrou um agendamento no mesmo horário
      if (existingAppointment && !checkError) {
        returnValidationErrors(inputSchema, {
          date: { _errors: ["Este horário não está disponível"] },
        });
      }

      // Criar o agendamento na tabela "appointments"
      const { data: newAppointment, error: insertError } = await supabase
        .from("appointments")
        .insert({
          customer_id: customerId,
          service_id: serviceId,
          professional_id: professionalId || null,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          status: "pending",
        })
        .select()
        .single();

      if (insertError || !newAppointment) {
        return {
          success: false,
          error: "Erro ao criar agendamento. Tente novamente.",
        };
      }

      // Se tem profissional, criar comissão
      if (professionalId) {
        // Buscar o preço e taxa de comissão do serviço
        const { data: serviceData } = await supabase
          .from("services")
          .select("price, commission_rate")
          .eq("id", serviceId)
          .single();

        if (serviceData && serviceData.price && serviceData.commission_rate) {
          const commissionAmount = (serviceData.price * serviceData.commission_rate) / 100;
          
          // Inserir comissão
          await supabase
            .from("professional_commissions")
            .insert({
              professional_id: professionalId,
              appointment_id: newAppointment.id,
              service_id: serviceId,
              commission_rate: serviceData.commission_rate,
              commission_amount: commissionAmount,
              commission_period: appointmentDate,
              status: "pending",
            });
        }
      }

      revalidatePath("/bookings");
      revalidatePath("/");

      return {
        success: true,
        booking: newAppointment as AppointmentResponse,
      };
    }
  );
