# 🔗 Guia de Integração Redis em APIs Existentes

## 📋 Template Rápido para Atualizar APIs

### 1. API GET (com Cache)

```typescript
// app/api/barbershops/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withCache, CACHE_KEYS } from '@/lib/cache'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const data = await withCache(
      CACHE_KEYS.BARBERSHOPS.key,
      async () => {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('barbershops')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      },
      CACHE_KEYS.BARBERSHOPS.ttl
    )

    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', 'public, max-age=3600')
    return response
  } catch (error) {
    console.error('[API] Erro:', error)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
```

### 2. API POST (com Invalidação)

```typescript
import { invalidateBarbershopsCache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('barbershops')
      .insert([body])
      .select()

    if (error) throw error

    // ⭐ IMPORTANTE: Invalidar cache após criar
    await invalidateBarbershopsCache()

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] Erro:', error)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
```

### 3. API PUT (com Invalidação)

```typescript
import { invalidateBarbershopsCache } from '@/lib/cache'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('barbershops')
      .update(body)
      .eq('id', id)
      .select()

    if (error) throw error

    // ⭐ IMPORTANTE: Invalidar cache após atualizar
    await invalidateBarbershopsCache()

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[API] Erro:', error)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
```

### 4. API DELETE (com Invalidação)

```typescript
import { invalidateBarbershopsCache } from '@/lib/cache'

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('barbershops')
      .delete()
      .eq('id', id)

    if (error) throw error

    // ⭐ IMPORTANTE: Invalidar cache após deletar
    await invalidateBarbershopsCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro:', error)
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
```

## 🎯 APIs Prioritárias para Integração

### 1️⃣ Barbershops
```typescript
import { withCache, invalidateBarbershopsCache, CACHE_KEYS } from '@/lib/cache'

GET  → withCache(CACHE_KEYS.BARBERSHOPS.key, ...)
POST/PUT/DELETE → await invalidateBarbershopsCache()
```

### 2️⃣ Services
```typescript
import { withCache, invalidateServicesCache, CACHE_KEYS } from '@/lib/cache'

GET  → withCache(CACHE_KEYS.SERVICES.key, ...)
POST/PUT/DELETE → await invalidateServicesCache()
```

### 3️⃣ Catalogs
```typescript
import { withCache, invalidateCatalogsCache, CACHE_KEYS } from '@/lib/cache'

GET  → withCache(CACHE_KEYS.CATALOGS.key, ...)
POST/PUT/DELETE → await invalidateCatalogsCache()
```

### 4️⃣ Products
```typescript
import { withCache, invalidateProductsCache, CACHE_KEYS } from '@/lib/cache'

GET  → withCache(CACHE_KEYS.PRODUCTS.key, ...)
POST/PUT/DELETE → await invalidateProductsCache()
```

### 5️⃣ Employees
```typescript
import { withCache, invalidateEmployeesCache, CACHE_KEYS } from '@/lib/cache'

GET  → withCache(CACHE_KEYS.EMPLOYEES.key, ...)
POST/PUT/DELETE → await invalidateEmployeesCache()
```

### 6️⃣ Available Slots (Dinâmico)
```typescript
import { 
  withCache, 
  invalidateAvailableSlotsCache, 
  getCacheKey,
  CACHE_KEYS 
} from '@/lib/cache'

GET  → withCache(
  getCacheKey(CACHE_KEYS.AVAILABLE_SLOTS.key, { 
    barbershopId: id, 
    date: date 
  }),
  ...,
  300 // 5 minutos - dados dinâmicos
)

POST/PUT/DELETE → await invalidateAvailableSlotsCache(barbershopId)
```

## 🔍 Verificar Quais APIs Existem

```bash
# Listar todas as rotas de API
find app/api -name "route.ts" -o -name "route.js"

# Exemplo saída:
# app/api/barbershops/route.ts
# app/api/services/route.ts
# app/api/catalogs/route.ts
# app/api/products/route.ts
# app/api/employees/route.ts
# app/api/available-slots/route.ts
```

## 📝 Checklist por API

### Barbershops
- [ ] Adicionar cache ao GET
- [ ] Adicionar invalidação ao POST
- [ ] Adicionar invalidação ao PUT
- [ ] Adicionar invalidação ao DELETE
- [ ] Testar cache hits/misses

### Services
- [ ] Adicionar cache ao GET
- [ ] Adicionar invalidação ao POST
- [ ] Adicionar invalidação ao PUT
- [ ] Adicionar invalidação ao DELETE
- [ ] Testar cache hits/misses

### Catalogs
- [ ] Adicionar cache ao GET
- [ ] Adicionar invalidação ao POST
- [ ] Adicionar invalidação ao PUT
- [ ] Adicionar invalidação ao DELETE
- [ ] Testar cache hits/misses

### Products
- [ ] Adicionar cache ao GET
- [ ] Adicionar invalidação ao POST
- [ ] Adicionar invalidação ao PUT
- [ ] Adicionar invalidação ao DELETE
- [ ] Testar cache hits/misses

### Employees
- [ ] Adicionar cache ao GET
- [ ] Adicionar invalidação ao POST
- [ ] Adicionar invalidação ao PUT
- [ ] Adicionar invalidação ao DELETE
- [ ] Testar cache hits/misses

### Available Slots
- [ ] Adicionar cache com parâmetros
- [ ] Adicionar invalidação com barbershopId
- [ ] Testar cache com diferentes datas
- [ ] Validar TTL de 5 minutos

## 🧪 Como Testar Cache

### 1. Verificar Logs
```bash
npm run dev | grep CACHE

# Esperado:
# [CACHE MISS] barbershops        (1ª requisição)
# [CACHE HIT] barbershops         (2ª requisição)
```

### 2. Testar com curl
```bash
# 1ª requisição (miss)
curl http://localhost:3000/api/barbershops
# [CACHE MISS]

# 2ª requisição (hit)
curl http://localhost:3000/api/barbershops
# [CACHE HIT]

# Após POST/PUT/DELETE (invalidação)
curl http://localhost:3000/api/barbershops
# [CACHE MISS] (foi limpo)
```

### 3. Inspecionar Redis
```bash
# Conectar ao Redis
docker exec -it aparatus-redis redis-cli

# Ver chaves em cache
KEYS *

# Ver valor de uma chave
GET barbershops

# Ver TTL (tempo restante)
TTL barbershops

# Deletar chave manualmente
DEL barbershops

# Sair
exit
```

## 📊 Impacto Esperado

Após implementar cache em uma API:

```
ANTES (sem cache):
curl http://localhost:3000/api/barbershops
↓
Resposta: ~500ms
Requisições ao banco: 1

DEPOIS (com cache):
1ª curl: ~500ms (não está em cache ainda)
2ª curl: ~5ms (vem do cache!)
3ª curl: ~5ms (vem do cache!)
...

Tempo economizado: 495ms × n requisições
Economia ao banco: 99% menos requisições
```

## 🚨 Troubleshooting

### Cache não funciona
- [ ] Redis está rodando? `docker ps | grep redis`
- [ ] Logs mostram `[REDIS] Conectado`?
- [ ] Usando `withCache()`?
- [ ] TTL é suficiente (mín 60s)?

### Cache nem sempre funciona
- [ ] Verificar se há múltiplas rotas GET diferentes
- [ ] Usar mesma `key` para mesmos dados
- [ ] Testar com redis-cli: `GET barbershops`

### Dados velhos no cache
- [ ] TTL muito alto? (diminuir)
- [ ] Invalidação não está sendo chamada?
- [ ] Limpar manualmente: `DEL barbershops` via redis-cli

## 🎯 Resumo

1. **GET endpoints:** Envolver com `withCache()`
2. **POST/PUT/DELETE:** Chamar `invalidate*Cache()` no final
3. **Testar:** Ver logs `[CACHE HIT]`/`[CACHE MISS]`
4. **Monitorar:** Usar redis-cli ou dashboard Upstash

Isso é tudo! 🎉

---

**Tempo estimado de integração:** 30 minutos para 5 APIs principais
