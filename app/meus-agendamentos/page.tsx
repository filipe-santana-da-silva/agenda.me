"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  PageContainer,
  PageSectionContent,
} from "@/components/ui/page";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Booking {
  id: string;
  barbershop: {
    name: string;
    image_url: string;
  };
  service: {
    name: string;
    image_url: string;
    price: number;
  };
  professional: {
    name: string;
  };
  appointment_date: string;
  appointment_time: string;
  status: string;
}

const MeusAgendamentosPage = () => {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Criar cliente DENTRO do useEffect para evitar re-renders infinitos
    const supabase = createClient();
    
    // Verificar se usuário está logado
    const savedUser = localStorage.getItem("bookingUser");
    if (!savedUser) {
      router.push("/booking?login=true");
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    // Buscar agendamentos do cliente
    const fetchBookings = async () => {
      try {
        // Buscar cliente pelo telefone
        const { data: customerDataArray, error: customerError } = await supabase
          .from("customers")
          .select("id, phone")
          .eq("phone", parsedUser.phone)
          .limit(1); // Pega apenas o primeiro cliente

        if (customerError) {
          console.error("Erro ao buscar cliente:", customerError);
          setBookings([]);
          setLoading(false);
          return;
        }

        const customerData = customerDataArray && customerDataArray.length > 0 ? customerDataArray[0] : null;

        if (!customerData) {
          console.warn("Cliente não encontrado com telefone:", parsedUser.phone);
          setBookings([]);
          setLoading(false);
          return;
        }

        console.log("Cliente encontrado:", customerData);
        console.log("Buscando agendamentos para customer_id:", customerData.id);

        // Primeiro, fazer uma query SEM LIMITE para ver o total
        const { count: totalCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true });
        console.log("Total de agendamentos NO BANCO (sem filtro):", totalCount);

        // Buscar agendamentos do cliente - TODOS os agendamentos (passados e futuros)
        // Usar paginação para garantir que carrega TODOS os registros
        let allAppointments: Record<string, unknown>[] = [];
        let hasMore = true;
        let from = 0;
        const pageSize = 500;

        while (hasMore) {
          const { data: pageData, error: pageError } = await supabase
            .from("appointments")
            .select("*")
            .eq("customer_id", customerData.id)
            .order("appointment_date", { ascending: false })
            .range(from, from + pageSize - 1);

          if (pageError) {
            console.error("Erro ao buscar agendamentos (página):", pageError);
            setError(pageError.message);
            setBookings([]);
            setLoading(false);
            return;
          }

          if (!pageData || pageData.length === 0) {
            hasMore = false;
          } else {
            allAppointments = [...allAppointments, ...pageData];
            console.log(`Página carregada: ${from}-${from + pageSize - 1}, itens: ${pageData.length}, total acumulado: ${allAppointments.length}`);
            from += pageSize;
            
            // Se recebeu menos itens que o tamanho da página, não há mais
            if (pageData.length < pageSize) {
              hasMore = false;
            }
          }
        }

        const appointmentsData = allAppointments;

        if (!appointmentsData || appointmentsData.length === 0) {
          console.warn("Nenhum agendamento encontrado para o cliente");
          setBookings([]);
          setLoading(false);
          return;
        }

        // Log para debug - DETALHADO
        console.log(`Total de agendamentos encontrados: ${appointmentsData.length}`, appointmentsData);
        console.log("Datas dos agendamentos:", appointmentsData.map((a) => (a as Record<string, unknown>).appointment_date));
        
        // Separar por data
        const byDate: Record<string, Record<string, unknown>[]> = {};
        appointmentsData.forEach((a) => {
          const appointment = a as Record<string, unknown>;
          const date = appointment.appointment_date as string;
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(a);
        });
        console.log("Agendamentos agrupados por data:", byDate);

        // Extrair IDs únicos
        const serviceIds = [...new Set(appointmentsData.map((a) => (a as Record<string, unknown>).service_id).filter(Boolean))];
        const professionalIds = [...new Set(appointmentsData.map((a) => (a as Record<string, unknown>).professional_id).filter(Boolean))];

        let servicesMap: Record<string, Record<string, unknown>> = {};
        let barbershopsMap: Record<string, Record<string, unknown>> = {};
        let employeesMap: Record<string, Record<string, unknown>> = {};

        // Buscar serviços específicos (apenas os usados nos agendamentos)
        if (serviceIds.length > 0) {
          try {
            const { data: servicesData, error: servicesError } = await supabase
              .from("services")
              .select("*")
              .in("id", serviceIds);

            if (servicesError) {
              console.error("Erro ao buscar serviços:", servicesError);
            } else if (servicesData && servicesData.length > 0) {
              servicesMap = Object.fromEntries(
                servicesData.map((s) => [s.id, s])
              );
              console.log(`Serviços carregados: ${servicesData.length}`, servicesData);

              // Buscar barbearias dos serviços encontrados
              const barbershopIds = [...new Set(servicesData.map((s) => s.barbershop_id).filter(Boolean))];
              if (barbershopIds.length > 0) {
                const { data: barbershopsData, error: barbershopsError } = await supabase
                  .from("barbershops")
                  .select("id, name, image_url")
                  .in("id", barbershopIds);

                if (barbershopsError) {
                  console.error("Erro ao buscar barbearias:", barbershopsError);
                } else if (barbershopsData && barbershopsData.length > 0) {
                  barbershopsMap = Object.fromEntries(
                    barbershopsData.map((b) => [b.id, b])
                  );
                  console.log(`Barbearias carregadas: ${barbershopsData.length}`, barbershopsData);
                }
              }
            }
          } catch (error) {
            console.error("Erro ao buscar serviços e barbearias:", error);
          }
        }

        // Buscar profissionais específicos
        if (professionalIds.length > 0) {
          try {
            const { data: employeesData, error: employeesError } = await supabase
              .from("employees")
              .select("id, name")
              .in("id", professionalIds);

            if (employeesError) {
              console.error("Erro ao buscar profissionais:", employeesError);
            } else if (employeesData && employeesData.length > 0) {
              employeesMap = Object.fromEntries(
                employeesData.map((e) => [e.id, e])
              );
              console.log(`Profissionais carregados: ${employeesData.length}`, employeesData);
            }
          } catch (error) {
            console.error("Erro ao buscar profissionais:", error);
          }
        }

        const formattedBookings = (appointmentsData || []).map((booking) => {
          const b = booking as Record<string, unknown>;
          const serviceData = servicesMap[b.service_id as string] as Record<string, unknown> | undefined;
          const barbershopData = barbershopsMap[(serviceData?.barbershop_id as string) ?? ""] as Record<string, unknown> | undefined;
          const employeeData = employeesMap[b.professional_id as string] as Record<string, unknown> | undefined;
          
          return {
            id: (b.id as string) || "",
            barbershop: {
              name: (barbershopData?.name as string) || "Barbearia",
              image_url: (barbershopData?.image_url as string) || "/default-barbershop.png",
            },
            service: {
              name: (serviceData?.name as string) || "Serviço",
              image_url: "/default-service.png",
              price: (serviceData?.price as number) || 0,
            },
            professional: {
              name: (employeeData?.name as string) || "Profissional",
            },
            appointment_date: (b.appointment_date as string) || "",
            appointment_time: (b.appointment_time as string) || "",
            status: (b.status as string) || "pending",
          };
        });
        
        console.log(`Agendamentos formatados (${formattedBookings.length}):`, formattedBookings);
        
        setBookings(formattedBookings);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Erro fatal ao buscar agendamentos:", error);
        setError(error.message || "Erro ao buscar agendamentos");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  if (loading) {
    return (
      <div>
        <Header userName={user?.name} />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando agendamentos...</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header userName={user?.name} />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">Erro: {error}</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div>
      <Header userName={user?.name} />
      <PageContainer>
        <h1 className="text-2xl font-bold mb-6">Meus Agendamentos</h1>

        {bookings.length > 0 ? (
          <PageSectionContent>
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {booking.service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.barbershop.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Profissional: {booking.professional.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(booking.appointment_date + "T00:00:00").toLocaleDateString(
                          "pt-BR"
                        )}{" "}
                        às {booking.appointment_time}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        R$ {booking.service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                    }`}>
                      {booking.status === "pending"
                        ? "Pendente"
                        : booking.status === "confirmed"
                          ? "Confirmado"
                          : booking.status === "completed"
                            ? "Finalizado"
                            : booking.status === "cancelled"
                              ? "Cancelado"
                              : booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PageSectionContent>
        ) : (
          <PageSectionContent>
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhum agendamento encontrado.{" "}
              <a
                href="/booking"
                className="text-primary hover:underline font-medium"
              >
                Agendar agora
              </a>
            </p>
          </PageSectionContent>
        )}
      </PageContainer>
      <Footer />
    </div>
  );
};

export default MeusAgendamentosPage;
