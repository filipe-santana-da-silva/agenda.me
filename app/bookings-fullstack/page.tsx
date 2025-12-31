import Header from "@/components/fullstack/header";
import Footer from "@/components/fullstack/footer";
import Image from "next/image";
import {
  PageContainer,
  PageSectionContent,
  PageSectionScroller,
  PageSectionTitle,
} from "@/components/ui/page";
import QuickSearch from "@/components/fullstack/quick-search";
import { getUserBookings } from "@/data/bookings";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function BookingsFullstackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { confirmedBookings } = await getUserBookings();

  // Dados estáticos da barbearia
  const barbershop = {
    id: "barbershop-001",
    name: "Barbearia Premium",
    address: "Rua Exemplo, 123 - Centro",
    description: "Barbearia com profissionais experientes oferecendo os melhores serviços",
    image_url:
      "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=500&h=500&fit=crop",
    phones: ["(11) 9999-9999", "(11) 3333-3333"],
    services: [
      {
        id: "service-1",
        name: "Corte Masculino",
        description: "Corte clássico e moderno",
        price_in_cents: 5000,
        duration_minutes: 30,
        barbershop_id: "barbershop-001",
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url:
          "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=300&h=300&fit=crop",
      },
      {
        id: "service-2",
        name: "Barba Completa",
        description: "Limpeza e design de barba",
        price_in_cents: 3500,
        duration_minutes: 20,
        barbershop_id: "barbershop-001",
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url:
          "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=300&h=300&fit=crop",
      },
      {
        id: "service-3",
        name: "Corte + Barba",
        description: "Pacote completo de corte e design de barba",
        price_in_cents: 7500,
        duration_minutes: 45,
        barbershop_id: "barbershop-001",
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url:
          "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=300&h=300&fit=crop",
      },
    ],
    professionals: [
      {
        id: "prof-1",
        name: "João Silva",
        email: "joao@example.com",
        phone: "(11) 99999-9999",
        image_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        specialty: "Cortes modernos",
        bio: "Profissional experiente com 5 anos de experiência",
        barbershop_id: "barbershop-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "prof-2",
        name: "Carlos Santos",
        email: "carlos@example.com",
        phone: "(11) 98888-8888",
        image_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        specialty: "Design de barba",
        bio: "Especialista em design e manutenção de barba",
        barbershop_id: "barbershop-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  return (
    <div>
      <Header />
      <PageContainer>
        <QuickSearch />

        {/* Banner */}
        <div className="relative h-auto w-full overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=1200&h=400&fit=crop"
            alt="Agende nos melhores com a Aparatus"
            width={1200}
            height={400}
            className="h-auto w-full"
          />
        </div>

        {/* Agendamentos Confirmados */}
        {confirmedBookings.length > 0 && (
          <PageSectionContent>
            <PageSectionTitle>Meus Agendamentos</PageSectionTitle>
            <PageSectionScroller>
              {confirmedBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="flex h-full w-full min-w-full cursor-pointer flex-row items-center justify-between p-0"
                >
                  <div className="flex flex-1 flex-col gap-4 p-4">
                    <Badge>CONFIRMADO</Badge>
                    <div className="flex flex-col gap-2">
                      <p className="font-bold">{booking.service?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.appointment_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex h-full w-26.5 flex-col items-center justify-center border-l py-3">
                    <p className="text-xs capitalize">
                      {new Date(booking.appointment_date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm font-bold">
                      R$ {(booking.service?.price_in_cents ? (booking.service.price_in_cents / 100).toFixed(2) : "N/A")}
                    </p>
                  </div>
                </Card>
              ))}
            </PageSectionScroller>
          </PageSectionContent>
        )}

        {/* Serviços da Barbearia */}
        <PageSectionContent>
          <PageSectionTitle>Serviços Disponíveis</PageSectionTitle>
          <div className="space-y-3">
            {barbershop.services.map((service) => (
              <div
                key={service.id}
                className="border-border bg-card rounded-lg border p-4"
              >
                <div className="flex gap-4">
                  {service.image_url && (
                    <div className="relative h-20 w-20 shrink-0">
                      <Image
                        src={service.image_url}
                        alt={service.name}
                        fill
                        className="rounded object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⏱️ {service.duration_minutes} min
                    </p>
                    <p className="text-sm font-bold mt-2">
                      R$ {(service.price_in_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageSectionContent>

        {/* Profissionais */}
        <PageSectionContent>
          <PageSectionTitle>Nossos Profissionais</PageSectionTitle>
          <div className="space-y-3">
            {barbershop.professionals.map((professional) => (
              <div
                key={professional.id}
                className="border-border bg-card rounded-lg border p-4"
              >
                <div className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    <Image
                      src={professional.image_url}
                      alt={professional.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{professional.name}</h3>
                    <p className="text-sm text-primary">
                      {professional.specialty}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {professional.bio}
                    </p>
                    <a
                      href={`tel:${professional.phone}`}
                      className="text-sm text-primary hover:underline mt-2 block"
                    >
                      {professional.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageSectionContent>

        {/* Informações de Contato */}
        <PageSectionContent>
          <PageSectionTitle>Contato</PageSectionTitle>
          <div className="border-border bg-card rounded-lg border p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-sm mb-2">
                {barbershop.name}
              </h3>
              <p className="text-sm text-muted-foreground">{barbershop.address}</p>
            </div>
            <div className="space-y-2">
              {barbershop.phones.map((phone, idx) => (
                <a
                  key={idx}
                  href={`tel:${phone}`}
                  className="block text-sm text-primary hover:underline"
                >
                  📞 {phone}
                </a>
              ))}
            </div>
          </div>
        </PageSectionContent>
      </PageContainer>
      <Footer />
    </div>
  );
}
