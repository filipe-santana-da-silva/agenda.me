import { getRedisClient, isRedisConnected } from './redis'
import { InMemoryCache, RedisCache } from './cache-classes'
import type { ICache } from './cache-classes'

/**
 * Configuração de TTL para diferentes tipos de dados
 */
const CACHE_CONFIG = {
  BARBERSHOPS: { key: 'barbershops', ttl: 3600 }, // 1 hora
  SERVICES: { key: 'services', ttl: 3600 }, // 1 hora
  EMPLOYEES: { key: 'employees', ttl: 1800 }, // 30 minutos
  AVAILABLE_SLOTS: { key: 'available_slots', ttl: 300 }, // 5 minutos
  CATALOGS: { key: 'catalogs', ttl: 3600 }, // 1 hora
  PRODUCTS: { key: 'products', ttl: 3600 }, // 1 hora
  USERS: { key: 'users', ttl: 1800 }, // 30 minutos
  BOOKINGS: { key: 'bookings', ttl: 600 }, // 10 minutos
}

/**
 * Instâncias globais de cache
 */
let inMemoryCache: InMemoryCache | null = null
let redisCache: RedisCache | null = null
let cacheType: 'redis' | 'memory' = 'memory'

/**
 * Inicializa cache (Redis ou in-memory)
 */
async function initializeCache(): Promise<ICache> {
  // Se já está inicializado, retorna
  if (cacheType === 'redis' && redisCache) {
    return redisCache
  }

  if (cacheType === 'memory' && inMemoryCache) {
    return inMemoryCache
  }

  // Tentar Redis primeiro
  const redisClient = await getRedisClient()
  if (redisClient) {
    redisCache = new RedisCache(redisClient)
    cacheType = 'redis'
    console.log('[CACHE] Usando Redis')
    return redisCache
  }

  // Fallback para in-memory
  if (!inMemoryCache) {
    inMemoryCache = new InMemoryCache()
  }
  cacheType = 'memory'
  console.log('[CACHE] Usando In-Memory (Redis não disponível)')
  return inMemoryCache
}

/**
 * Obtém instância de cache
 */
async function getCacheInstance(): Promise<ICache> {
  if (cacheType === 'redis' && redisCache) {
    return redisCache
  }

  if (cacheType === 'memory' && inMemoryCache) {
    return inMemoryCache
  }

  return initializeCache()
}

/**
 * Wrapper para usar cache transparentemente
 * Se dados estão em cache, retorna do cache
 * Senão, executa fetcher e armazena em cache
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  try {
    const cache = await getCacheInstance()

    // Tentar obter do cache
    const cached = await cache.get<T>(key)
    if (cached) {
      console.log(`[CACHE HIT] ${key}`)
      return cached
    }

    // Se não estiver em cache, buscar dados
    console.log(`[CACHE MISS] ${key}`)
    const data = await fetcher()

    // Armazenar em cache
    await cache.set(key, data, ttl)

    return data
  } catch (error) {
    console.error(`[CACHE ERROR] ${key}:`, error)
    // Se houver erro, apenas execute fetcher sem cache
    return fetcher()
  }
}

/**
 * Invalidar cache para uma chave específica
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    const cache = await getCacheInstance()
    await cache.delete(key)
    console.log(`[CACHE INVALIDATED] ${key}`)
  } catch (error) {
    console.error(`[CACHE ERROR] Erro ao invalidar ${key}:`, error)
  }
}

/**
 * Invalidar múltiplas chaves de cache
 */
export async function invalidateMultipleCache(keys: string[]): Promise<void> {
  try {
    const cache = await getCacheInstance()
    await Promise.all(keys.map((key) => cache.delete(key)))
    console.log(`[CACHE INVALIDATED] ${keys.length} chaves`)
  } catch (error) {
    console.error('[CACHE ERROR] Erro ao invalidar múltiplas chaves:', error)
  }
}

/**
 * Invalidar cache de barbearias
 */
export async function invalidateBarbershopsCache(): Promise<void> {
  await invalidateCache(CACHE_CONFIG.BARBERSHOPS.key)
}

/**
 * Invalidar cache de serviços
 */
export async function invalidateServicesCache(): Promise<void> {
  await invalidateCache(CACHE_CONFIG.SERVICES.key)
}

/**
 * Invalidar cache de funcionários
 */
export async function invalidateEmployeesCache(): Promise<void> {
  await invalidateCache(CACHE_CONFIG.EMPLOYEES.key)
}

/**
 * Invalidar cache de catálogos
 */
export async function invalidateCatalogsCache(): Promise<void> {
  await invalidateCache(CACHE_CONFIG.CATALOGS.key)
}

/**
 * Invalidar cache de produtos
 */
export async function invalidateProductsCache(): Promise<void> {
  await invalidateCache(CACHE_CONFIG.PRODUCTS.key)
}

/**
 * Invalidar cache de horários disponíveis
 */
export async function invalidateAvailableSlotsCache(barbershopId?: string): Promise<void> {
  if (barbershopId) {
    await invalidateCache(`${CACHE_CONFIG.AVAILABLE_SLOTS.key}:${barbershopId}`)
  } else {
    await invalidateCache(CACHE_CONFIG.AVAILABLE_SLOTS.key)
  }
}

/**
 * Limpar todo o cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const cache = await getCacheInstance()
    await cache.clear()
    console.log('[CACHE] Todo o cache foi limpo')
  } catch (error) {
    console.error('[CACHE ERROR] Erro ao limpar cache:', error)
  }
}

/**
 * Gerar chave de cache com parâmetros
 */
export function getCacheKey(
  baseKey: string,
  params?: Record<string, unknown>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseKey
  }

  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
    .join('|')

  return `${baseKey}:${paramStr}`
}

/**
 * Retorna informações sobre o cache
 */
export async function getCacheInfo(): Promise<{
  type: 'redis' | 'memory'
  connected: boolean
  redisConnected?: boolean
}> {
  return {
    type: cacheType,
    connected: true,
    redisConnected: isRedisConnected(),
  }
}

export const CACHE_KEYS = CACHE_CONFIG
