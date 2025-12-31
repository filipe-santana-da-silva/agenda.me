# 🚀 Implementação Redis - Guia Completo

## ✅ O que foi implementado

Sistema de cache com **Redis** que funciona com fallback automático para in-memory. A aplicação:
- ✅ Tenta conectar ao Redis na inicialização
- ✅ Usa Redis se disponível (cache compartilhado entre instâncias)
- ✅ Fallback para in-memory se Redis não estiver disponível
- ✅ Mantém compatibilidade total com código existente

## 📦 Pacotes Instalados

```bash
npm install redis
```

## 📁 Arquivos Criados/Modificados

### 1. **lib/redis.ts** - Gerenciador de Conexão Redis
Responsável por:
- Conectar ao Redis com retry automático
- Gerenciar eventos de conexão
- Fornecer fallback seguro

```typescript
// Uso interno
const client = await getRedisClient()
if (client) {
  // Redis disponível
}

// Verificar status
console.log(isRedisConnected()) // true/false
```

### 2. **lib/cache-classes.ts** - Implementações de Cache
Duas classes que implementam a mesma interface:

```typescript
// InMemoryCache - para desenvolvimento local
// RedisCache - para produção com múltiplas instâncias
```

### 3. **lib/cache.ts** - ATUALIZADO
Agora com suporte completo a Redis:
- Inicialização automática
- Fallback transparente
- Logs informativos

### 4. **.env.local** - ATUALIZADO
Novas variáveis de ambiente:

```env
# Redis local (padrão)
REDIS_URL=redis://localhost:6379

# Redis com autenticação
REDIS_URL=redis://:password@host:port

# Desabilitar Redis (usar apenas in-memory)
REDIS_DISABLED=true
```

## 🚀 Como Usar

### Desenvolvimento Local (IN-MEMORY)

```bash
# Já funciona sem configuração
npm run dev

# Logs mostrarão:
# [CACHE] Usando In-Memory (Redis não disponível)
```

### Com Redis Local

#### Opção 1: Docker (Recomendado)

```bash
# Iniciar Redis em Docker
docker run -d \
  --name redis-aparatus \
  -p 6379:6379 \
  redis:alpine

# Verificar se está rodando
docker ps | grep redis
```

#### Opção 2: Instalar Redis Localmente

**Windows (WSL2 ou WSL1):**
```bash
# No WSL
sudo apt-get install redis-server
redis-server
```

**macOS:**
```bash
brew install redis
redis-server
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Opção 3: Redis em Produção (Vercel)

Usar um serviço Redis gerenciado como:
- **Upstash**: https://upstash.com (Recomendado)
- **Redis Cloud**: https://redis.com/cloud/
- **Heroku Redis**: https://www.heroku.com/redis

**Configurar variável de ambiente:**
```env
REDIS_URL=redis://default:password@host:port
```

## 🔧 Configuração

### 1. Definir REDIS_URL

Edite `.env.local`:

```env
# Desenvolvimento com Docker
REDIS_URL=redis://localhost:6379

# Produção (Upstash exemplo)
REDIS_URL=redis://:seu-password@seu-host.upstash.io:12345

# Desabilitar Redis (fallback para in-memory)
REDIS_DISABLED=true
```

### 2. Iniciar Aplicação

```bash
npm run dev
# Logs mostrarão o tipo de cache sendo usado
```

## 📊 Exemplos de Uso

### Cache Básico

```typescript
import { withCache, CACHE_KEYS } from '@/lib/cache'

// GET com cache (já implementado)
const barbershops = await withCache(
  CACHE_KEYS.BARBERSHOPS.key,
  async () => {
    const { data } = await supabase.from('barbershops').select('*')
    return data
  },
  CACHE_KEYS.BARBERSHOPS.ttl
)
```

### Invalidar Cache Após Criar/Atualizar

```typescript
import {
  invalidateBarbershopsCache,
  invalidateCatalogsCache,
  invalidateMultipleCache,
} from '@/lib/cache'

// POST - Criar barbearia
export async function POST() {
  // ... criar dados
  await invalidateBarbershopsCache() // Limpa cache imediatamente
  return NextResponse.json(newBarbershop)
}

// PUT - Atualizar
export async function PUT() {
  // ... atualizar dados
  await invalidateBarbershopsCache()
  return NextResponse.json(updatedData)
}

// DELETE - Deletar
export async function DELETE() {
  // ... deletar dados
  await invalidateBarbershopsCache()
  return NextResponse.json({ success: true })
}

// Invalidar múltiplos caches
await invalidateMultipleCache([
  CACHE_KEYS.CATALOGS.key,
  CACHE_KEYS.PRODUCTS.key,
])
```

### Cache com Chaves Parametrizadas

```typescript
import { getCacheKey, withCache } from '@/lib/cache'

// Cache com parâmetros
const key = getCacheKey('available-slots', {
  barbershopId: '123',
  date: '2025-01-15',
})

const slots = await withCache(
  key,
  async () => {
    // Buscar horários disponíveis
  },
  300 // 5 minutos
)
```

### Verificar Status do Cache

```typescript
import { getCacheInfo } from '@/lib/cache'

const info = await getCacheInfo()
console.log(info)
// { type: 'redis', connected: true, redisConnected: true }
```

## 📈 Configuração de TTL

TTL (Time-To-Live) em segundos:

```typescript
{
  BARBERSHOPS: 3600,       // 1 hora - Dados estáticos
  SERVICES: 3600,          // 1 hora - Dados estáticos
  EMPLOYEES: 1800,         // 30 min - Dados menos frequentes
  AVAILABLE_SLOTS: 300,    // 5 min - Dados dinâmicos (alteram frequentemente)
  CATALOGS: 3600,          // 1 hora - Dados de catálogo
  PRODUCTS: 3600,          // 1 hora - Dados de produtos
  USERS: 1800,             // 30 min - Dados de usuários
  BOOKINGS: 600,           // 10 min - Dados de agendamentos
}
```

**Quando aumentar TTL:**
- Dados que mudam raramente (dias/semanas) → 3600s ou mais
- Dados que mudam ocasionalmente (horas) → 1800s
- Dados que mudam frequentemente (minutos) → 300-600s

**Quando diminuir TTL:**
- Dados que mudam muito frequentemente → 60-300s

## 🔍 Debugging e Logs

### Logs Automáticos

```
[CACHE] Usando Redis
[CACHE HIT] barbershops              // Encontrado em cache
[CACHE MISS] barbershops             // Não estava em cache
[CACHE INVALIDATED] barbershops      // Cache foi limpo

[REDIS] Conectado com sucesso
[REDIS] Tentando reconectar...
[REDIS] Erro ao conectar: ...        // Fallback para in-memory
```

### Verificar Conexão Redis

```typescript
import { pingRedis } from '@/lib/redis'

const connected = await pingRedis()
console.log('Redis conectado:', connected)
```

### Limpar Cache Manualmente

```typescript
import { clearAllCache } from '@/lib/cache'

// Em uma API ou ação do servidor
await clearAllCache()
```

## 🚨 Troubleshooting

### Redis Não Conecta

**Problema:** Logs mostram `[REDIS] Erro ao conectar`

**Solução:**
1. Verificar se Redis está rodando:
   ```bash
   # Docker
   docker ps | grep redis
   
   # Local
   redis-cli ping
   ```
2. Verificar REDIS_URL em `.env.local`
3. Verificar firewall/portas

### Cache Não Está Sendo Usado

**Problema:** Dados sempre parecem frescos/não vêm do cache

**Solução:**
1. Verificar se `withCache()` está sendo usado na API
2. Verificar se TTL é suficientemente grande (mínimo 60s)
3. Verificar logs: se não ver `[CACHE HIT]`, não está em cache
4. Forçar limpeza: `await clearAllCache()`

### Performance Pior com Cache

**Problema:** Aplicação mais lenta com Redis

**Solução:**
1. Redis pode estar sobrecarregado
2. Aumentar RAM do servidor Redis
3. Verificar latência de rede
4. Em desenvolvimento, usar in-memory: `REDIS_DISABLED=true`

### Memory Leak em In-Memory

**Problema:** Aplicação consome muita RAM após horas

**Solução:**
1. InMemoryCache já limpa automaticamente itens expirados
2. Diminuir TTL para dados menos importantes
3. Usar Redis em produção para escalar melhor

## 📊 Monitoramento

### Performance esperada

**Com Cache (Redis/Memory):**
- 1ª requisição: ~500ms (busca do banco)
- 2ª+ requisições (cache válido): ~5-20ms

**Improvement:**
- -95% de latência
- -80% de carga no banco

### Ferramentas de Monitoramento

**Desenvolvimento:**
```bash
# Verificar logs no terminal
npm run dev | grep CACHE
```

**Produção (Upstash):**
- Dashboard em https://console.upstash.com
- Métricas de uso, hits/misses

**Redis Local:**
```bash
# CLI do Redis
redis-cli

# Dentro do redis-cli
INFO # Info completa
DBSIZE # Quantidade de chaves
KEYS * # Listar todas as chaves
TTL <chave> # Ver TTL de uma chave
FLUSHDB # Limpar banco (cuidado!)
```

## 🔐 Segurança

### Em Desenvolvimento
- Usar Redis local ou Docker (sem autenticação necessária)

### Em Produção
- ✅ **Usar Upstash ou Redis Cloud** (com SSL/TLS automático)
- ✅ Nunca commitar `.env` com credenciais
- ✅ Usar variáveis de ambiente no servidor/Vercel
- ✅ Revogar credenciais se vazar

**Redis URL segura:**
```env
# NÃO usar em produção (inseguro)
REDIS_URL=redis://localhost:6379

# ✅ Usar serviço gerenciado (seguro)
REDIS_URL=redis://:token@host.upstash.io:port
```

## 📋 Checklist de Implementação

- [x] Instalar pacote redis
- [x] Criar lib/redis.ts (conexão)
- [x] Criar lib/cache-classes.ts (interfaces)
- [x] Atualizar lib/cache.ts (com Redis)
- [x] Adicionar variáveis de ambiente
- [ ] **Testar localmente com Docker**
- [ ] **Atualizar todas as APIs GET com cache**
- [ ] **Adicionar invalidação em todas as APIs POST/PUT/DELETE**
- [ ] **Testar em staging com Upstash**
- [ ] **Deploy em produção com Upstash**

## 🔗 Próximos Passos

1. **Iniciar Redis Local (Docker):**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Testar Conexão:**
   ```bash
   npm run dev # Verificar logs
   ```

3. **Aplicar Cache às APIs Existentes:**
   - GET /api/barbershops
   - GET /api/services
   - GET /api/catalogs
   - GET /api/products
   - GET /api/employees

4. **Adicionar Invalidação aos Endpoints de Escrita:**
   - POST/PUT/DELETE em todas as rotas

5. **Deploy em Produção:**
   - Criar conta Upstash (gratuito até 10GB)
   - Configurar REDIS_URL no Vercel
   - Deploy

## 📚 Links Úteis

- [Redis Docs](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Upstash (Redis Gerenciado)](https://upstash.com)
- [Redis CLI Tutorial](https://redis.io/topics/rediscli)
- [Cache Strategies](https://redis.io/docs/manual/patterns/index/)

---

**Status:** ✅ Pronto para usar (com fallback automático para in-memory)
