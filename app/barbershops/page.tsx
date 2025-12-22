import { notFound } from "next/navigation"
import Header from "@/components/fullstack/header"
import Footer from "@/components/fullstack/footer"
import QuickSearch from "@/components/fullstack/quick-search"

import { getBarbershops, getBarbershopsByServiceName } from "@/data/barbershops"

/**
 * Busca de Barbearias - Server Component
 * Recebe searchParams.search para filtrar por nome do serviço
 */

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function BarbershopsPage({
  searchParams,
}: BarbershopsPageProps) {
  const { search } = await searchParams

  // Buscar barbearias com base no parâmetro de busca
  let barbershops = []

  if (search && search.trim()) {
    // Se há busca, buscar por nome de serviço
    barbershops = await getBarbershopsByServiceName(search.trim())
  } else {
    // Senão, retornar todas as barbearias
    barbershops = await getBarbershops()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-5 py-6 space-y-6">
        {/* QuickSearch Component */}
        <QuickSearch />

        {/* Título da seção */}
        <section>
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">
              {search ? `Resultados para "${search}"` : "Todas as Barbearias"}
            </h1>
            <p className="text-muted-foreground">
              {barbershops.length} barbearia{barbershops.length !== 1 ? "s" : ""} encontrada
              {barbershops.length !== 1 ? "s" : ""}
            </p>
          </div>

        </section>
      </main>

      <Footer />
    </div>
  )
}
