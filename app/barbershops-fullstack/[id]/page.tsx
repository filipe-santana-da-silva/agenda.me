import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import Image from "next/image"

export default function BarbershopDetailPage() {
  // Dados de exemplo para a UI
  const barbershop = {
    id: "barbershop-001",
    name: "Barbearia Exemplo",
    address: "Rua Exemplo, 123",
    description: "Barbearia com profissionais experientes oferecendo os melhores serviços de corte e design.",
    image_url: "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=500&h=500&fit=crop",
    phones: ["(11) 9999-9999", "(11) 3333-3333"],
    services: [
      {
        id: "1",
        name: "Corte Masculino",
        description: "Corte clássico e moderno",
        price_in_cents: 5000,
        image_url: "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=300&h=300&fit=crop"
      },
      {
        id: "2",
        name: "Barba Completa",
        description: "Limpeza e design de barba",
        price_in_cents: 3500,
        image_url: "https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=300&h=300&fit=crop"
      }
    ],
    professionals: [
      {
        id: "1",
        name: "João Silva",
        email: "joao@example.com",
        phone: "(11) 99999-9999",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        specialty: "Cortes modernos",
        bio: "Profissional experiente com 5 anos de experiência"
      },
      {
        id: "2",
        name: "Carlos Santos",
        email: "carlos@example.com",
        phone: "(11) 98888-8888",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        specialty: "Design de barba",
        bio: "Especialista em design e manutenção de barba"
      }
    ]
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={barbershop.image_url}
            alt={barbershop.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-6 px-5 py-6">
          <div>
            <h1 className="text-3xl font-bold">{barbershop.name}</h1>
            <p className="text-muted-foreground">{barbershop.address}</p>
            <p className="mt-2">{barbershop.description}</p>
          </div>

          {/* Telefones */}
          {barbershop.phones.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Contato</h2>
              <div className="space-y-2">
                {barbershop.phones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone}`}
                    className="block text-primary hover:underline"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Serviços */}
          {barbershop.services.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Serviços</h2>
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
                        <p className="text-sm font-bold mt-2">
                          R$ {(service.price_in_cents / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
