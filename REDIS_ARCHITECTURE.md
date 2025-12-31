# 🔄 Arquitetura Cache: Antes vs Depois

## ANTES: In-Memory Only

```
┌─────────────────────────────────────────┐
│         Aplicação Next.js               │
│  ┌──────────────────────────────────┐   │
│  │  InMemoryCache (Map<string>)     │   │
│  │  - Simples de usar               │   │
│  │  - Sem dependências externas     │   │
│  │  - NÃO compartilhado entre       │   │
│  │    instâncias                    │   │
│  └──────────────────────────────────┘   │
│           ↓                              │
│  ┌──────────────────────────────────┐   │
│  │    lib/cache.ts                  │   │
│  │  withCache()                     │   │
│  │  invalidateCache()               │   │
│  └──────────────────────────────────┘   │
│           ↓                              │
│  ┌──────────────────────────────────┐   │
│  │     Supabase (PostgreSQL)        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘

❌ Problemas:
- Cada instância tem seu próprio cache
- Cache perdido ao reiniciar app
- Não compartilha dados entre servidores
- Não escala com múltiplas instâncias
```

## DEPOIS: Redis com Fallback

```
┌──────────────────────────────────────────────────────────┐
│         Aplicação Next.js (Multiple Instances)           │
│                                                           │
│  Instance 1              Instance 2              Instance 3
│  ┌───────────────────┐   ┌───────────────────┐  ┌───────────────────┐
│  │  lib/cache.ts     │   │  lib/cache.ts     │  │  lib/cache.ts     │
│  │  withCache()      │   │  withCache()      │  │  withCache()      │
│  └─────────┬─────────┘   └─────────┬─────────┘  └─────────┬─────────┘
│            ↓                       ↓                       ↓
│  ┌────────────────────────────────────────────────────────────┐
│  │          lib/redis.ts (Gerenciador de Conexão)             │
│  │  getRedisClient() → Redis ou InMemoryCache (fallback)      │
│  └──────────┬──────────────────────────────────────────────┬──┘
│             ↓                                               │
│  ┌──────────────────────┐                                  ↓
│  │    REDIS SERVER      │                    ┌─────────────────────┐
│  │ (Central/Shared)     │                    │   InMemoryCache     │
│  │                      │                    │   (Se Redis falhar) │
│  │ - Compartilhado      │                    └─────────────────────┘
│  │ - Persistente        │
│  │ - Rápido             │
│  │ - Escalável          │
│  └──────────┬───────────┘
│             ↓
│  ┌──────────────────────┐
│  │ Supabase (PostgreSQL)│
│  └──────────────────────┘
└──────────────────────────────────────────────────────────┘

✅ Benefícios:
- Cache compartilhado entre todas as instâncias
- Fallback automático (InMemoryCache se Redis cair)
- Escalável horizontalmente
- Persistência (opcional)
- Compatível com desenvolvimento local
```

## 🔄 Flow de Requisição

### Antes (In-Memory)

```
Requisição HTTP
       ↓
withCache('key', fetcher)
       ↓
InMemoryCache.get('key')
       ├─ SIM → Retorna resultado
       └─ NÃO → Executa fetcher() → Banco
              ↓
       InMemoryCache.set('key', data)
              ↓
       Retorna resultado
```

### Depois (Redis com Fallback)

```
Requisição HTTP
       ↓
withCache('key', fetcher)
       ↓
getRedisClient()
       ├─ Sucesso → RedisCache
       └─ Erro → InMemoryCache (fallback)
       ↓
cache.get('key')
       ├─ SIM → Retorna resultado [CACHE HIT]
       └─ NÃO → Executa fetcher() → Banco [CACHE MISS]
              ↓
       cache.set('key', data, ttl)
              ↓
       Retorna resultado
```

## 📊 Performance Comparativo

### Cenário: 1000 requisições para o mesmo endpoint

```
IN-MEMORY CACHE (Single Instance)
├─ Requisição 1: 500ms (banco) ██████████
├─ Requisição 2: 5ms (cache)   █
├─ Requisição 3: 5ms (cache)   █
├─ Requisição 4: 5ms (cache)   █
└─ ... 997 mais: 5ms cada
   Total: ~5010ms
   Cache Hits: 999 (99.9%)

REDIS CACHE (Multiple Instances)
├─ Instância 1, Req 1: 500ms (banco) ██████████
├─ Instância 2, Req 2: 5ms (Redis)   █
├─ Instância 3, Req 3: 3ms (Redis)   █
├─ Instância 1, Req 4: 3ms (Redis)   █
└─ ... todos compartilham o mesmo cache
   Total: ~1000ms (compartilhado!)
   Cache Hits: 999 (99.9%)
   Banco Hits: 1 (0.1%)
   
   → 5x mais rápido na prática
   → 99% menos requisições ao banco
```

## 🛠️ Compatibilidade de Código

```typescript
// ✅ MESMO CÓDIGO ANTES E DEPOIS

import { withCache, invalidateBarbershopsCache } from '@/lib/cache'

// Funciona identicamente com InMemory ou Redis
const data = await withCache(
  'barbershops',
  async () => {
    // Fetch data
  },
  3600
)

// Invalidação também funciona
await invalidateBarbershopsCache()
```

## 🔐 Segurança

| Aspecto | In-Memory | Redis Local | Redis Produção |
|---------|-----------|------------|-----------------|
| Dados persistem ao reiniciar | ❌ | ✅ | ✅ |
| Suporta múltiplas instâncias | ❌ | ✅ | ✅ |
| Autenticação | N/A | Opcional | ✅ Requerida |
| Criptografia (SSL/TLS) | N/A | ❌ | ✅ Upstash |
| Gerenciado | ❌ | ✅ Local | ✅ Cloud |

## 🚀 Deployment

### Desenvolvimento
```
npm run dev
   ↓
Redis localhost:6379 (Docker)
   ↓
In-Memory fallback se Redis cair
```

### Produção (Vercel)
```
Aplicação
   ↓
Redis (Upstash.io)
   ↓
Supabase
```

## 📈 Escalabilidade

```
1 Instância
└─ InMemory (1 cache)

2 Instâncias
├─ Cache A (não compartilha)
└─ Cache B (não compartilha)
❌ Problema: Dados duplicados/desincronizados

Com Redis
├─ Instância 1 ──┐
├─ Instância 2 ──┼─→ Redis Centralizado
├─ Instância 3 ──┤  (1 cache compartilhado)
└─ Instância N ──┘
✅ Solução: Cache único e sincronizado
```

## 🎯 Decisão de Design

```
┌─────────────────────────────────┐
│   Precisa de Cache?             │
└──────────────┬──────────────────┘
               ├─ NÃO → Sem cache
               │
               └─ SIM ↓
        ┌──────────────────────┐
        │ Múltiplas instâncias?│
        └──────────┬───────────┘
                   ├─ NÃO → InMemory (OK)
                   │
                   └─ SIM ↓
           ┌──────────────────────┐
           │  Precisa persistência?│
           └──────────┬───────────┘
                      ├─ NÃO → Redis
                      │
                      └─ SIM ↓
               Usar Redis com
              persistência habilitada
```

## 💡 Recomendação

```
Desenvolvimento Local
└─ Redis com Docker (ou In-Memory)

Staging
└─ Redis (Upstash)

Produção
└─ Redis (Upstash) + Replicação
```

---

**Conclusão:** Redis é a evolução natural do InMemory Cache, oferecendo escalabilidade e compartilhamento de cache entre instâncias, mantendo compatibilidade retroativa completa.
