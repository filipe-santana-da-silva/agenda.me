import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import QuickSearch from "@/components/fullstack/quick-search"
import BarbershopItem from "@/components/barbershop-item"
import BookingItem from "@/components/booking-item"
import { getPopularBarbershops } from "@/data/barbershops"
import { getUserBookings } from "@/data/bookings"

/**
 * Home Page - Server Component
 * Exibe agendamentos confirmados (se usuário logado) e barbearias populares
 */
export default async function Home() {
  // Fetch dados em paralelo
  const [barbershops, { confirmedBookings }] = await Promise.all([
    getPopularBarbershops(),
    getUserBookings(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-5 py-6 space-y-6">
        {/* Search Bar */}
        <QuickSearch />

        {/* Seção: Agendamentos Confirmados (apenas se logado e tiver agendamentos) */}
        {confirmedBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3">Agendamentos Confirmados</h2>
            <div className="grid grid-cols-1 gap-3">
              {confirmedBookings.slice(0, 3).map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        )}

        {/* Seção: Barbearias Populares */}
        <section>
          <h2 className="text-lg font-bold mb-3">Barbearias Populares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        </section>

        {/* Se não houver barbearias, mostrar mensagem */}
        {barbershops.length === 0 && (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">
              Nenhuma barbearia disponível no momento.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
