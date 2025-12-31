/**
 * Interface genérica para Cache (In-Memory ou Redis)
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  exists(key: string): Promise<boolean>
}

/**
 * Interface para cliente Redis
 */
export interface RedisClientType {
  get(key: string): Promise<string | null>
  setEx(key: string, ttl: number, value: string): Promise<string>
  del(key: string): Promise<number>
  flushDb(): Promise<string>
  exists(key: string): Promise<number>
}

/**
 * Cache em memória (fallback quando Redis não está disponível)
 */
export class InMemoryCache implements ICache {
  private cache = new Map<string, { value: unknown; expiresAt: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Verificar se expirou
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000

    this.cache.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key)
    if (!item) return false

    // Verificar expiração
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Limpar itens expirados (executar periodicamente)
   */
  cleanupExpired(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

/**
 * Cache com Redis
 */
export class RedisCache implements ICache {
  constructor(private client: RedisClientType) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key)
      if (!data) return null

      return JSON.parse(data) as T
    } catch (error) {
      console.error(`[REDIS] Erro ao buscar chave ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      await this.client.setEx(key, ttl, serialized)
    } catch (error) {
      console.error(`[REDIS] Erro ao salvar chave ${key}:`, error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error(`[REDIS] Erro ao deletar chave ${key}:`, error)
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushDb()
    } catch (error) {
      console.error('[REDIS] Erro ao limpar cache:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      console.error(`[REDIS] Erro ao verificar chave ${key}:`, error)
      return false
    }
  }
}
