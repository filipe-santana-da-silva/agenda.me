import Image from "next/image"
import { Smartphone } from "lucide-react"
import Link from "next/link"
import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import { Button } from "@/components/ui/button"

/**
 * Detalhes da Barbearia - Server Component
 * Exibe informações completas da barbearia, serviços e contato
 */

interface BarbershopDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BarbershopDetailPage({
  params,
}: BarbershopDetailPageProps) {
  const { id } = await params

  // Dados estáticos da barbearia
  const barbershop = {
    id: "barbershop-001",
    name: "Barbearia Premium",
    address: "Rua Exemplo, 123 - Centro",
    description: "Barbearia com profissionais experientes oferecendo os melhores serviços",
    image_url: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
    phones: ["(11) 9999-9999", "(11) 3333-3333"],
    services: [
      {
        id: "9d9b6f6f-404e-4f60-898d-79c952861ddd",
        name: "Corte de Cabelo",
        description: "Estilo personalizado com as últimas tendências.",
        price_in_cents: 6000,
        image_url: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        id: "e4a02801-fbad-4e15-bb87-2c66d1c88a6f",
        name: "Barba",
        description: "Modelagem completa para destacar sua masculinidade.",
        price_in_cents: 4000,
        image_url: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        id: "ae4a94d4-09f0-465c-bfa7-34f49d9ad705",
        name: "Massagem",
        description: "Relaxe com uma massagem revigorante.",
        price_in_cents: 5000,
        image_url: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
      },
      {
        id: "88c76d70-0bc1-44cb-a1e4-50490da8b76f",
        name: "Hidratação",
        description: "Hidratação profunda para cabelo e barba.",
        price_in_cents: 2500,
        image_url: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        id: "943375c1-5dc5-4ad0-a3e2-53e95366945d",
        name: "Sobrancelha",
        description: "Expressão acentuada com modelagem precisa.",
        price_in_cents: 2000,
        image_url: "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
      },
      {
        id: "daffea72-e9e3-4f53-9cbc-7b3a9d40cebe",
        name: "Pézinho",
        description: "Acabamento perfeito para um visual renovado.",
        price_in_cents: 3500,
        image_url: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
    ],
    professionals: [
      {
        id: "prof-1",
        name: "João Silva",
        specialty: "Cortes modernos",
        bio: "Profissional experiente com 5 anos de experiência",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      },
      {
        id: "prof-2",
        name: "Carlos Santos",
        specialty: "Design de barba",
        bio: "Especialista em design e manutenção de barba",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      },
    ],
  }

  // Formatar números de telefone para links
  const formatPhoneLink = (phone: string) => {
    const clean = phone.replace(/\D/g, "")
    return `https://wa.me/${clean}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Banner com imagem da barbearia */}
        <div className="relative h-[300px] w-full">
          <Image
            src={barbershop.image_url}
            alt={barbershop.name}
            fill
            className="object-cover"
          />
          {/* Botão voltar */}
          <Link
            href="/booking"
            className="absolute top-4 left-4 z-10"
          >
            <Button variant="outline" size="icon" className="bg-white/90">
              ←
            </Button>
          </Link>
        </div>

        {/* Container do conteúdo */}
        <div className="relative z-10 -mt-8 bg-background rounded-t-3xl px-5 py-6">
          {/* Info da Barbearia */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src={barbershop.image_url}
                alt={barbershop.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">{barbershop.name}</h1>
              <p className="text-sm text-muted-foreground">{barbershop.address}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 border-t" />

          {/* Seção: Sobre */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Sobre</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {barbershop.description}
            </p>
          </section>

          {/* Divider */}
          <div className="my-6 border-t" />

          {/* Seção: Profissionais */}
          {barbershop.professionals && barbershop.professionals.length > 0 && (
            <>
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-4">Profissionais</h2>
                <div className="space-y-4">
                  {barbershop.professionals.map((professional: { id: string; name: string; specialty: string; bio?: string; image_url: string }) => (
                    <div
                      key={professional.id}
                      className="flex gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {professional.image_url && (
                        <div className="relative w-20 h-20 shrink-0">
                          <Image
                            src={professional.image_url}
                            alt={professional.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{professional.name}</h3>
                        <p className="text-sm text-primary font-medium mb-1">
                          {professional.specialty}
                        </p>
                        {professional.bio && (
                          <p className="text-sm text-muted-foreground">
                            {professional.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Divider */}
              <div className="my-6 border-t" />
            </>
          )}

          {/* Seção: Serviços */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4">Serviços</h2>
            <div className="space-y-4">
              {barbershop.services.map((service) => (
                <div
                  key={service.id}
                  className="flex gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {service.image_url && (
                    <div className="relative w-20 h-20 shrink-0">
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
                    <p className="text-sm text-muted-foreground mb-2">
                      {service.description}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      R$ {(service.price_in_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Link
                      href={`/confirm?barbershopId=${barbershop.id}&serviceId=${service.id}`}
                    >
                      <Button size="sm">Agendar</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="my-6 border-t" />

          {/* Seção: Contato */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4">Contato</h2>
            <div className="space-y-3">
              {barbershop.phones && barbershop.phones.length > 0 ? (
                barbershop.phones.map((phone, index) => (
                  <a
                    key={index}
                    href={formatPhoneLink(phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-primary/5 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <p className="text-sm">{phone}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      WhatsApp
                    </Button>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum telefone disponível
                </p>
              )}
            </div>
          </section>

          {/* Espaço para footer */}
          <div className="pt-12" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
