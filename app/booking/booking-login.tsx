"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { useAuth } from "@/contexts/SimpleAuthContext";

export default function BookingLogin({ onLogin }: { onLogin: (user: { name: string; phone: string }) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { setUser } = useAuth ? useAuth() : { setUser: undefined };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Preencha nome e telefone.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Primeiro, busca se o cliente já existe pelo telefone
      const { data: existingCustomer, error: selectError } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", phone)
        .single();

      let customerData = { name, phone };

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 é o erro de "não encontrado", que é esperado
        throw new Error(selectError.message);
      }

      if (existingCustomer) {
        // Cliente já existe - usar dados existentes
        customerData = { name: existingCustomer.name, phone: existingCustomer.phone };
      } else {
        // Cliente não existe - criar novo
        const { error: insertError } = await supabase
          .from("customers")
          .insert({ 
            name, 
            phone
          });

        if (insertError) {
          setError("Erro ao registrar cliente: " + (insertError.message || "Tente novamente."));
          setLoading(false);
          return;
        }
      }

      localStorage.setItem("bookingUser", JSON.stringify(customerData));
      if (setUser) setUser({ id: "", email: "", role: "", name: customerData.name, phone: customerData.phone });
      onLogin(customerData);
      router.push("/booking");
    } catch (err: any) {
      setError(err.message || "Erro ao processar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Login do Cliente</h2>
        <input
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="tel"
          placeholder="Telefone (com DDD)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary/90 transition" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
