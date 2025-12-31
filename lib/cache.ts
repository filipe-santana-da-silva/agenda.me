/**
 * Sistema de Cache com Redis
 * Implementa cache para requisições frequentes da aplicação
 */

const CACHE_CONFIG = {
  BARBERSHOPS: { key: 'barbershops', ttl: 3600 }, // 1 hora
  SERVICES: { key: 'services', ttl: 3600 }, // 1 hora
  EMPLOYEES: { key: 'employees', ttl: 1800 }, // 30 minutos
  AVAILABLE_SLOTS: { key: 'available_slots', ttl: 300 }, // 5 minutos
  CATALOGS: { key: 'catalogs', ttl: 3600 }, // 1 hora
  PRODUCTS: { key: 'products', ttl: 3600 }, // 1 hora
};

/**
 * Cache em memória simples para ambientes sem Redis
 * Pode ser substituído por Redis em produção
 */
class InMemoryCache {
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    // Verificar se expirou
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  async set<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Limpar itens expirados periodicamente
  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60000); // A cada minuto
  }

  constructor() {
    this.startCleanup();
  }
}

// Instância global de cache
let cacheInstance: InMemoryCache | null = null;

function getCacheInstance(): InMemoryCache {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache();
  }
  return cacheInstance;
}

/**
 * Wrapper para cache com fallback automático
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cache = getCacheInstance();

  // Tentar obter do cache
  const cached = await cache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Se não estiver em cache, buscar dados
  const data = await fetcher();

  // Armazenar em cache
  await cache.set(key, data, ttl);

  return data;
}

/**
 * Invalidar cache por padrão de chave
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const cache = getCacheInstance();
  await cache.delete(pattern);
}

/**
 * Limpar todo o cache
 */
export async function clearAllCache(): Promise<void> {
  const cache = getCacheInstance();
  await cache.clear();
}

/**
 * Gerar chave de cache com parâmetros
 */
export function getCacheKey(
  baseKey: string,
  params?: Record<string, unknown>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }

  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
    .join('|');

  return `${baseKey}:${paramStr}`;
}

export const CACHE_KEYS = CACHE_CONFIG;
