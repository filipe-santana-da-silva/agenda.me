"use server";

import { createClient } from "@/utils/supabase/server";

export interface CreateAppointmentData {
  customerId: string;
  serviceId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  professionalId?: string;
  status?: string;
}

export async function createAppointment(data: CreateAppointmentData) {
  try {
    const supabase = await createClient();

    // Validações obrigatórias
    if (!data.serviceId) {
      return {
        success: false,
        error: "serviceId é obrigatório",
      };
    }

    if (!data.appointmentDate || !data.appointmentTime) {
      return {
        success: false,
        error: "Data e hora são obrigatórios",
      };
    }

    // Verificar se o cliente existe
    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, phone")
      .eq("id", data.customerId)
      .single();

    if (!customer) {
      return {
        success: false,
        error: "Cliente não encontrado",
      };
    }

    // Verificar se o serviço existe
    const { data: service } = await supabase
      .from("services")
      .select("id, name, price, commission_rate")
      .eq("id", data.serviceId)
      .single();

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Verificar se já existe um agendamento no mesmo horário com o mesmo profissional
    if (data.professionalId) {
      const { data: existingAppointment } = await supabase
        .from("appointments")
        .select("id")
        .eq("appointment_date", data.appointmentDate)
        .eq("appointment_time", data.appointmentTime)
        .eq("professional_id", data.professionalId)
        .eq("status", "confirmed");

      if (existingAppointment && existingAppointment.length > 0) {
        return {
          success: false,
          error: "Horário não disponível com este profissional",
        };
      }
    }

    // Criar agendamento
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        customer_id: data.customerId,
        service_id: data.serviceId,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        professional_id: data.professionalId || null,
        status: data.status || "pending",
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Erro ao criar agendamento",
      };
    }

    // Se tem profissional, criar comissão
    if (data.professionalId && service && service.price && service.commission_rate) {
      console.log("✅ Tentando criar comissão para profissional:", data.professionalId);
      
      const commissionAmount = (service.price * service.commission_rate) / 100;
      
      console.log("💰 Valores da comissão:", {
        professional_id: data.professionalId,
        appointment_id: appointment.id,
        service_name: service.name,
        customer_name: customer.name,
        service_price: service.price,
        commission_amount: commissionAmount,
        commission_rate: service.commission_rate,
        commission_period: data.appointmentDate,
      });
      
      // Inserir comissão com TODOS os campos obrigatórios do schema
      const { data: commissionData, error: commissionError } = await supabase
        .from("professional_commissions")
        .insert({
          professional_id: data.professionalId,
          appointment_id: appointment.id,
          service_name: service.name,
          customer_name: customer.name,
          service_price: service.price,
          commission_rate: service.commission_rate,
          commission_amount: commissionAmount,
          commission_period: data.appointmentDate,
          status: "pending",
        })
        .select();

      if (commissionError) {
        console.error("❌ Erro ao criar comissão:", commissionError);
      } else {
        console.log("✅ Comissão criada com sucesso:", commissionData);
      }
    } else {
      if (data.professionalId) {
        console.log("⚠️ Falta dados para criar comissão - price:", service?.price, "commission_rate:", service?.commission_rate);
      }
    }

    return {
      success: true,
      appointment,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      error: "Erro ao criar agendamento",
    };
  }
}

export async function getAvailableTimeSlots(
  serviceId: string,
  appointmentDate: string,
  professionalId?: string
) {
  try {
    const supabase = await createClient();

    // Horários disponíveis (9h às 18h, com intervalos de 1 hora)
    const timeSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    // Buscar agendamentos já existentes para esse dia
    let query = supabase
      .from("appointments")
      .select("appointment_time")
      .eq("appointment_date", appointmentDate)
      .eq("status", "confirmed");

    if (professionalId) {
      query = query.eq("professional_id", professionalId);
    }

    const { data: bookedSlots } = await query;

    const bookedTimes = (bookedSlots || []).map((slot) => slot.appointment_time);

    const availableSlots = timeSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    return {
      success: true,
      availableSlots,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar horários disponíveis",
    };
  }
}

export async function getServices() {
  try {
    const supabase = await createClient();

    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, description, price_in_cents, duration");

    if (servicesError) {
      return {
        success: false,
        error: "Erro ao buscar serviços",
      };
    }

    return {
      success: true,
      services,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar serviços",
    };
  }
}

export async function getProfessionals() {
  try {
    const supabase = await createClient();

    const { data: professionals, error: professionalsError } = await supabase
      .from("employees")
      .select("id, name, specialty, image_url");

    if (professionalsError) {
      return {
        success: false,
        error: "Erro ao buscar profissionais",
      };
    }

    return {
      success: true,
      professionals,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar profissionais",
    };
  }
}

export async function getCustomerInfo(customerId: string) {
  try {
    const supabase = await createClient();

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("id", customerId)
      .single();

    if (customerError) {
      return {
        success: false,
        error: "Cliente não encontrado",
      };
    }

    return {
      success: true,
      customer,
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar cliente",
    };
  }
}
