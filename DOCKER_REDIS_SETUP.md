# 🐳 Setup Rápido com Docker

## Opção 1: Docker Compose (RECOMENDADO)

Crie um arquivo `docker-compose.yml` na raiz do projeto:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: aparatus-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ""
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 5
    environment:
      - TZ=UTC

volumes:
  redis_data:
```

**Usar:**

```bash
# Iniciar Redis
docker-compose up -d

# Parar Redis
docker-compose down

# Ver logs
docker-compose logs -f redis

# Remover volume (cuidado!)
docker-compose down -v
```

## Opção 2: Docker Run (Simples)

```bash
# Iniciar
docker run -d \
  --name aparatus-redis \
  -p 6379:6379 \
  redis:7-alpine

# Parar
docker stop aparatus-redis

# Remover
docker rm aparatus-redis

# Ver logs
docker logs -f aparatus-redis
```

## Opção 3: Docker Desktop

1. Abra Docker Desktop
2. Procure por `redis`
3. Execute a imagem `redis:alpine`
4. Mapear porta `6379:6379`

## 🧪 Testar Conexão

### Dentro do Container

```bash
# Entrar no container Redis
docker exec -it aparatus-redis redis-cli

# Dentro do redis-cli:
ping          # Deve retornar PONG
set foo bar   # Salvar chave
get foo       # Buscar chave (deve retornar "bar")
dbsize        # Ver quantidade de chaves
exit          # Sair
```

### Do Node.js

```bash
# Executar teste
node scripts/test-redis.js
```

### Verificar em Produção

```bash
# Docker
docker exec -it aparatus-redis redis-cli

# WSL/Linux
redis-cli -h seu-host -p 6379 -a sua-senha

# Upstash (web console)
# https://console.upstash.com
```

## 📊 Monitorar

```bash
# Dentro de redis-cli:
INFO              # Informações completas
MONITOR           # Ver todas as operações em tempo real
DBSIZE            # Número total de chaves
KEYS *            # Listar todas as chaves
TTL <chave>       # Ver TTL em segundos
MEMORY USAGE      # Uso de memória
```

## 🔧 Configuração para .env.local

```env
# Desenvolvimento com Docker
REDIS_URL=redis://localhost:6379

# Sem autenticação (padrão acima)
# Com autenticação
REDIS_URL=redis://:password@localhost:6379

# Porta customizada
REDIS_URL=redis://localhost:6380

# Produção (Upstash)
REDIS_URL=redis://:seu-token@seu-host.upstash.io:seu-port
```

## ⚠️ Troubleshooting Docker

### Porta já está em uso

```bash
# Encontrar o processo
netstat -ano | findstr :6379

# Ou usar porta diferente
docker run -d -p 6380:6379 redis:alpine
# Então usar: REDIS_URL=redis://localhost:6380
```

### Redis não conecta

```bash
# Verificar se está rodando
docker ps | grep redis

# Verificar logs
docker logs aparatus-redis

# Testar conexão
docker exec aparatus-redis redis-cli ping
```

### Limpar tudo

```bash
# Parar container
docker stop aparatus-redis

# Remover container
docker rm aparatus-redis

# Remover volume
docker volume rm <volume-name>

# Remover imagem
docker rmi redis:alpine
```

## 🚀 Workflow Recomendado

```bash
# 1. Iniciar Redis no terminal
docker-compose up -d

# 2. Em outro terminal, iniciar Next.js
npm run dev

# 3. Verificar logs
docker logs -f aparatus-redis

# 4. Quando terminar
docker-compose down
```

## 📝 Adicionar ao .gitignore

```
# Redis
.redis/
redis_data/
dump.rdb
appendonly.aof
```

---

**Status:** Ready! Redis em Docker está pronto para desenvolvimento local.
