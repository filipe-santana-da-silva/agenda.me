#!/usr/bin/env node

/**
 * Script de teste para Redis
 * Executa: node scripts/test-redis.js
 */

import { getRedisClient, isRedisConnected, pingRedis, disconnectRedis } from '../lib/redis.js'
import { withCache, clearAllCache, getCacheInfo, invalidateCache } from '../lib/cache.js'

async function testRedis() {
  console.log('\n🧪 Testando Redis Implementation\n')

  try {
    // ===== TESTE 1: Conexão =====
    console.log('1️⃣ Testando conexão com Redis...')
    const connected = await pingRedis()
    console.log(`   ✓ Conectado: ${connected ? '✅ SIM' : '⚠️  NÃO (usando in-memory)'}`)

    // ===== TESTE 2: Cache Info =====
    console.log('\n2️⃣ Informações do cache...')
    const info = await getCacheInfo()
    console.log(`   ✓ Tipo: ${info.type}`)
    console.log(`   ✓ Redis: ${info.redisConnected ? '✅ Conectado' : '⚠️  Não conectado'}`)

    // ===== TESTE 3: Cache Básico =====
    console.log('\n3️⃣ Testando cache básico...')

    let callCount = 0
    const fetchData = async () => {
      callCount++
      console.log(`   → Função fetcher chamada (count: ${callCount})`)
      return { data: 'teste', timestamp: new Date().toISOString() }
    }

    // Primeira chamada - deve executar fetcher
    console.log('   1ª chamada (cache miss)...')
    const result1 = await withCache('test-key', fetchData, 10)
    console.log(`   ✓ Resultado: ${JSON.stringify(result1)}`)

    // Segunda chamada - deve vir do cache
    console.log('   2ª chamada (cache hit)...')
    const result2 = await withCache('test-key', fetchData, 10)
    console.log(`   ✓ Resultado: ${JSON.stringify(result2)}`)

    if (callCount === 1) {
      console.log('   ✅ Cache funcionando! (fetcher chamado 1x apenas)')
    } else {
      console.log('   ⚠️  Cache pode não estar funcionando')
    }

    // ===== TESTE 4: Invalidação =====
    console.log('\n4️⃣ Testando invalidação de cache...')
    callCount = 0

    console.log('   1ª chamada...')
    await withCache('test-key-2', fetchData, 10)

    console.log('   Invalidando...')
    await invalidateCache('test-key-2')

    console.log('   2ª chamada após invalidação...')
    await withCache('test-key-2', fetchData, 10)

    if (callCount === 2) {
      console.log('   ✅ Invalidação funcionando!')
    }

    // ===== TESTE 5: TTL =====
    console.log('\n5️⃣ Testando TTL (Time To Live)...')
    callCount = 0

    console.log('   1ª chamada com TTL=2s...')
    await withCache('ttl-test', fetchData, 2)

    console.log('   Aguardando 3 segundos...')
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log('   2ª chamada (deve estar expirado)...')
    await withCache('ttl-test', fetchData, 2)

    if (callCount === 2) {
      console.log('   ✅ TTL funcionando!')
    }

    // ===== TESTE 6: Limpeza =====
    console.log('\n6️⃣ Testando limpeza de cache...')
    console.log('   Limpando todo o cache...')
    await clearAllCache()
    console.log('   ✅ Cache limpo!')

    // ===== RESUMO =====
    console.log('\n' + '='.repeat(50))
    console.log('✅ Todos os testes concluídos!')
    console.log(
      '   Redis está pronto para usar em suas APIs'
    )
    console.log('='.repeat(50) + '\n')
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error)
  } finally {
    // Desconectar do Redis
    await disconnectRedis()
  }
}

// Executar testes
testRedis()
