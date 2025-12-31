/**
 * Hook para invalidação de cache
 * Usado em operações de create, update, delete
 */

import { invalidateCache, CACHE_KEYS } from "@/lib/cache"

export async function invalidateBarbershopsCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.BARBERSHOPS.key)
}

export async function invalidateServicesCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.SERVICES.key)
}

export async function invalidateEmployeesCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.EMPLOYEES.key)
}

export async function invalidateCatalogsCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.CATALOGS.key)
}

export async function invalidateProductsCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.PRODUCTS.key)
}

export async function invalidateAvailableSlotsCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.AVAILABLE_SLOTS.key)
}

/**
 * Invalidar múltiplos caches de uma vez
 */
export async function invalidateMultipleCache(
  keys: string[]
): Promise<void> {
  await Promise.all(keys.map((key) => invalidateCache(key)))
}
