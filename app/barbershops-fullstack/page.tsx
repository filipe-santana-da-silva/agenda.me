import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import QuickSearch from "@/components/fullstack/quick-search"
import BarbershopItem from "@/components/fullstack/barbershop-item"
import {
  getBarbershops,
  getBarbershopsByServiceName,
} from "@/data/barbershops"

interface SearchPageProps {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function BarbershopsPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const search = params.search || ""

  let barbershops = search
    ? await getBarbershopsByServiceName(search)
    : await getBarbershops()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="space-y-4 px-5 py-6">
          <QuickSearch />
        </div>

        <div className="space-y-4 px-5 py-6">
          <h2 className="text-xl font-bold">
            {search ? `Resultados para "${search}"` : "Todas as Barbearias"}
          </h2>

          {barbershops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma barbearia encontrada
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {barbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
