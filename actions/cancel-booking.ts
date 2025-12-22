"use server";

import { z } from "zod";
import { protectedActionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { createClient } from "@/utils/supabase/server";
import { isFuture } from "date-fns";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

const inputSchema = z.object({
  bookingId: z.uuid(),
});

export const cancelBooking = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { bookingId }, ctx: { user } }) => {
    const supabase = await createClient();

    // Buscar o agendamento
    const { data: booking, error: bookingError } = await supabase
      .from('booking')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      returnValidationErrors(inputSchema, {
        _errors: ["Agendamento não encontrado."],
      });
    }

    if (booking.user_id !== user.id) {
      returnValidationErrors(inputSchema, {
        _errors: ["Você não tem permissão para cancelar este agendamento."],
      });
    }

    if (booking.cancelled_at) {
      returnValidationErrors(inputSchema, {
        _errors: ["Este agendamento já foi cancelado."],
      });
    }

    const bookingDate = new Date(booking.date);
    if (!isFuture(bookingDate)) {
      returnValidationErrors(inputSchema, {
        _errors: ["Não é possível cancelar um agendamento passado."],
      });
    }

    // Processar reembolso do Stripe se houver
    if (booking.stripe_charge_id) {
      if (!process.env.STRIPE_SECRET_KEY) {
        returnValidationErrors(inputSchema, {
          _errors: ["Chave de API do Stripe não encontrada."],
        });
      }
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2025-12-15.clover",
        });
        await stripe.refunds.create({
          charge: booking.stripe_charge_id,
          reason: "requested_by_customer",
        });
      } catch (error) {
        console.error("Erro ao processar o reembolso do agendamento", error);
        returnValidationErrors(inputSchema, {
          _errors: [
            "Erro ao processar o reembolso do agendamento. Por favor, tente novamente.",
          ],
        });
      }
    }

    // Atualizar o agendamento
    const { data: cancelledBooking, error: updateError } = await supabase
      .from('booking')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      returnValidationErrors(inputSchema, {
        _errors: ["Erro ao cancelar agendamento."],
      });
    }

    revalidatePath("/");
    revalidatePath("/booking");
    return cancelledBooking;
  });

