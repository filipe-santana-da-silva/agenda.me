import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.error("🟢🟢🟢 POST /api/register-customer 🟢🟢🟢");
    
    const { name, phone } = await req.json();

    console.error("📥 Dados recebidos:", { name, phone });

    if (!name || !phone) {
      console.error("❌ Nome ou telefone ausente");
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Buscar cliente existente
    console.error("🔍 Buscando cliente existente com telefone:", phone);
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select("id, name, phone")
      .eq("phone", phone)
      .single();

    console.error("   Resultado:", { existingCustomer, findError });

    // Se encontrou, retorna
    if (existingCustomer) {
      console.error("✅ Cliente já existe:", existingCustomer.id);
      return NextResponse.json({
        success: true,
        customerId: existingCustomer.id,
        message: "Cliente encontrado",
      });
    }

    // 2. Criar novo cliente
    console.error("⏳ Criando novo cliente...");
    console.error("   INSERT INTO customers (name, phone)");
    console.error("   VALUES (", name, ",", phone, ")");

    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert({
        name: name,
        phone: phone,
      })
      .select()
      .single();

    console.error("⏸️ Resposta recebida");

    if (createError) {
      console.error("❌ ERRO DO SUPABASE:", {
        code: createError.code,
        message: createError.message,
        details: createError?.details,
        hint: createError?.hint,
      });
      return NextResponse.json(
        { error: `Erro ao criar cliente: ${createError.message}` },
        { status: 400 }
      );
    }

    if (!newCustomer) {
      console.error("❌ Cliente não foi retornado pelo Supabase");
      return NextResponse.json(
        { error: "Falha ao criar cliente" },
        { status: 400 }
      );
    }

    console.error("🟢🟢🟢 CLIENTE CRIADO COM SUCESSO 🟢🟢🟢");
    console.error("   ID:", newCustomer.id);
    console.error("   Name:", newCustomer.name);
    console.error("   Phone:", newCustomer.phone);

    return NextResponse.json({
      success: true,
      customerId: newCustomer.id,
      customer: newCustomer,
      message: "Cliente registrado com sucesso",
    });
  } catch (error) {
    console.error("💥 ERRO NA FUNÇÃO:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
