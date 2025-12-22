import { createClient } from "@/utils/supabase/server"

export interface Service {
  id: string
  name: string
  description: string
  image_url: string
  price_in_cents: number
  duration_minutes: number
  barbershop_id: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  name: string
  email: string | null
  phone: string | null
  image_url: string
  specialty: string
  bio: string | null
  barbershop_id: string
  created_at: string
  updated_at: string
}

export interface Barbershop {
  id: string
  name: string
  address: string
  description: string
  image_url: string
  phones: string[]
  services: Service[]
  professionals?: Employee[]
}

export const getBarbershops = async (): Promise<Barbershop[]> => {
  const supabase = await createClient()

  // Buscar barbearias
  let { data, error } = await supabase
    .from("barbershop")
    .select(
      `
      id,
      name,
      address,
      description,
      image_url,
      phones,
      services (
        id,
        name,
        description,
        image_url,
        price_in_cents,
        duration_minutes,
        barbershop_id,
        deleted_at,
        created_at,
        updated_at
      )
    `
    )
    .order("name")

  // Se falhar
  if (error) {
    const { data: oldData, error: oldError } = await supabase
      .from("barbershop")
      .select(
        `
        id,
        name,
        address,
        description,
        image_url,
        phones
      `
      )
      .order("name")

    if (oldError || !oldData) {
      console.error("Erro ao carregar barbearias:", error)
      return []
    }

    return (oldData as any[]).map((shop) => ({
      ...shop,
      services: [],
    }))
  }

  return (data as any[]).map((shop) => ({
    ...shop,
    services: (shop.services || []).filter(
      (s: any) => s.deleted_at === null
    ),
  }))
}

export const getPopularBarbershops = async (): Promise<Barbershop[]> => {
  const supabase = await createClient()

  let { data, error } = await supabase
    .from("barbershop")
    .select(
      `
      id,
      name,
      address,
      description,
      image_url,
      phones,
      services (
        id,
        name,
        description,
        image_url,
        price_in_cents,
        duration_minutes,
        barbershop_id,
        deleted_at,
        created_at,
        updated_at
      )
    `
    )
    .order("name")
    .limit(6)

  // Se falhar, tentar com a tabela antiga
  if (error) {
    const { data: oldData, error: oldError } = await supabase
      .from("barbershop")
      .select("id, name, address, description, image_url, phones")
      .order("name")
      .limit(6)

    if (oldError || !oldData) {
      console.error("Erro ao carregar barbearias populares:", error)
      return []
    }

    return (oldData as any[]).map((shop) => ({
      ...shop,
      services: [],
    }))
  }

  return (data as any[]).map((shop) => ({
    ...shop,
    services: (shop.services || []).filter(
      (s: any) => s.deleted_at === null
    ),
  }))
}

export const getBarbershopById = async (
  id: string
): Promise<Barbershop | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("barbershop")
    .select(
      `
      id,
      name,
      address,
      description,
      image_url,
      phones,
      employees (
        id,
        name,
        email,
        phone,
        image_url,
        specialty,
        bio,
        barbershop_id,
        created_at,
        updated_at
      ),
      services (
        id,
        name,
        description,
        image_url,
        price_in_cents,
        duration_minutes,
        barbershop_id,
        deleted_at,
        created_at,
        updated_at
      )
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Erro ao carregar barbearia:", error)
    return null
  }

  if (!data) return null

  return {
    ...data,
    professionals: data.employees || [],
    services: (data.services || []).filter(
      (s: any) => s.deleted_at === null
    ),
  }
}

export const getBarbershopsByServiceName = async (
  serviceName: string
): Promise<Barbershop[]> => {
  const supabase = await createClient()

  let { data, error } = await supabase
    .from("barbershop")
    .select(
      `
      id,
      name,
      address,
      description,
      image_url,
      phones,
      services (
        id,
        name,
        description,
        image_url,
        price_in_cents,
        duration_minutes,
        barbershop_id,
        deleted_at,
        created_at,
        updated_at
      )
    `
    )

  if (error) {
    console.error("Erro ao buscar barbearias por serviço:", error)
    // Tentar buscar sem os serviços
    const { data: oldData, error: oldError } = await supabase
      .from("barbershop")
      .select("id, name, address, description, image_url, phones")

    if (oldError || !oldData) {
      return []
    }

    return (oldData as any[]).map((shop) => ({
      ...shop,
      services: [],
    }))
  }

  if (!data) {
    return []
  }

  // Filter on client side - barbershops that have at least one service matching the search
  const filtered = (data as any[])
    .filter((shop) =>
      (shop.services || []).some(
        (service: any) =>
          service.deleted_at === null &&
          service.name.toLowerCase().includes(serviceName.toLowerCase())
      )
    )
    .map((shop) => ({
      ...shop,
      services: (shop.services || []).filter(
        (s: any) => s.deleted_at === null
      ),
    }))

  return filtered
}
