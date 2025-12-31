import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null
let isConnected = false

/**
 * Inicializa e retorna cliente Redis
 * Se não conseguir conectar, retorna null (fallback para in-memory)
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  // Se já está conectado, retorna
  if (isConnected && redisClient) {
    return redisClient
  }

  // Se Redis está desabilitado, retorna null
  if (process.env.REDIS_DISABLED === 'true') {
    console.log('[CACHE] Redis desabilitado')
    return null
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('[REDIS] Máximo de tentativas de reconexão atingido')
            return new Error('Redis máximo de retries')
          }
          return retries * 50
        },
      },
    })

    // Event listeners
    redisClient.on('error', (err) => {
      console.error('[REDIS] Erro:', err)
      isConnected = false
    })

    redisClient.on('connect', () => {
      console.log('[REDIS] Conectado com sucesso')
      isConnected = true
    })

    redisClient.on('ready', () => {
      console.log('[REDIS] Pronto para usar')
    })

    redisClient.on('reconnecting', () => {
      console.log('[REDIS] Tentando reconectar...')
    })

    // Conectar
    await redisClient.connect()
    isConnected = true

    return redisClient
  } catch (error) {
    console.warn(
      '[REDIS] Falha na conexão, usando cache em memória:',
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
    redisClient = null
    isConnected = false
    return null
  }
}

/**
 * Verifica se Redis está conectado
 */
export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null
}

/**
 * Desconecta do Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && isConnected) {
    try {
      await redisClient.quit()
      isConnected = false
      redisClient = null
      console.log('[REDIS] Desconectado')
    } catch (error) {
      console.error('[REDIS] Erro ao desconectar:', error)
    }
  }
}

/**
 * Ping para verificar conexão
 */
export async function pingRedis(): Promise<boolean> {
  try {
    const client = await getRedisClient()
    if (!client) return false

    const pong = await client.ping()
    return pong === 'PONG'
  } catch (error) {
    console.error('[REDIS] Ping falhou:', error)
    return false
  }
}
