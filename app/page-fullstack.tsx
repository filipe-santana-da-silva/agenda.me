import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import QuickSearch from "@/components/fullstack/quick-search"
import BarbershopItem from "@/components/fullstack/barbershop-item"
import { getBarbershops, getPopularBarbershops } from "@/data/barbershops"
import { getUserBookings } from "@/data/bookings"
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const popularBarbershops = await getPopularBarbershops()
  const userBookings = user ? await getUserBookings() : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Quick Search */}
        <div className="space-y-4 px-5 py-6">
          <QuickSearch />
        </div>

        {/* User Bookings Section */}
        {user && userBookings && userBookings.confirmedBookings && userBookings.confirmedBookings.length > 0 && (
          <div className="space-y-4 px-5 py-6">
            <h2 className="text-xl font-bold">Seus Agendamentos</h2>
            <div className="space-y-3">
              {userBookings.confirmedBookings.slice(0, 1).map((booking) => (
                <div
                  key={booking.id}
                  className="border-border bg-card rounded-lg border p-4"
                >
                  {booking.service && (
                    <>
                      <p className="text-sm font-semibold">
                        {booking.service.name}
                      </p>
                      <p className="text-xs">
                        {new Date(booking.appointment_date).toLocaleString("pt-BR")}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Barbershops */}
        <div className="space-y-4 px-5 py-6">
          <h2 className="text-xl font-bold">Barbearias Populares</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {popularBarbershops.map((barbershop) => (
              <div key={barbershop.id} className="min-w-72.5">
                <BarbershopItem barbershop={barbershop} />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
