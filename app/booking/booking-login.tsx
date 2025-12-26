"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">✂️</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Agendamento</CardTitle>
          <CardDescription className="text-center">
            Faça login para continuar seu agendamento
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-400 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-6 font-semibold text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin">⌛</span>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Primeira vez aqui?</p>
            <p>Crie uma conta ao continuar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
