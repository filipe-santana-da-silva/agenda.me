# Redis Integration - Testing Guide

## Prerequisites
1. Redis running: `docker ps | grep redis`
2. Docker container: `aparatus-redis` 
3. .env.local with `REDIS_URL=redis://localhost:6379`

## Testing Each Endpoint

### 1. Test Users Endpoint
```bash
# First request (Cache MISS - queries database)
curl -X GET http://localhost:3000/api/users

# Response should include all users
# Notice "X-Redis-Cache: MISS" in headers (if implemented)

# Second request (Cache HIT - returns from Redis)
curl -X GET http://localhost:3000/api/users

# Much faster response time
# The timestamp should be identical to first request
```

### 2. Test Transactions Endpoint
```bash
# Base request (no filters)
curl -X GET http://localhost:3000/api/transactions/all

# With filters (different cache key)
curl -X GET "http://localhost:3000/api/transactions/all?type=income&status=completed"

# Each combination generates unique cache key:
# transactions:user:userId:type:income:status:completed
```

### 3. Test Appointments POST (Cache Invalidation)
```bash
# Check cache before
curl -X GET http://localhost:3000/api/test-cache

# Create appointment
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "123",
    "appointment_date": "2025-03-15",
    "appointment_time": "14:00",
    "service_id": "456"
  }'

# Cache should be invalidated for:
# - appointments:all
# - available-slots:all
# - appointments:customer:123
# - available-slots:date:2025-03-15
```

### 4. Test Customers Endpoint
```bash
# First request
curl -X GET http://localhost:3000/api/customers

# Should return: [{ id, name, phone }, ...]
# Cache: customers:all (1800s TTL)
```

### 5. Test Services Endpoint
```bash
# First request (longest cache - 1 hour)
curl -X GET http://localhost:3000/api/services

# Should return: [{ id, name, duration, price }, ...]
# Cache: services:all (3600s TTL)
```

### 6. Test Employees Endpoint
```bash
# First request
curl -X GET http://localhost:3000/api/employees

# Should return: [{ id, name, email, position, image_url }, ...]
# Cache: employees:active (1800s TTL)
```

## Monitoring Cache Operations

### View Redis Keys in Real-Time
```bash
# Connect to Redis
docker exec -it aparatus-redis redis-cli

# List all keys
KEYS *

# Example output:
# 1) "system_users:all"
# 2) "customers:all"
# 3) "services:all"
# 4) "employees:active"
# 5) "transactions:user:user123:..."
```

### Check Cache Expiration
```bash
# Connect to Redis
docker exec -it aparatus-redis redis-cli

# Check TTL of a key
TTL system_users:all

# Example output:
# (integer) 1742  <- seconds until expiration
```

### Clear Specific Cache
```bash
docker exec -it aparatus-redis redis-cli

# Delete single key
DEL system_users:all

# Delete multiple keys
DEL customers:all employees:active services:all

# Clear entire database
FLUSHDB

# Verify empty
KEYS *
# (empty array)
```

### Monitor Live Cache Activity
```bash
docker exec -it aparatus-redis redis-cli MONITOR
```

## Performance Benchmarking

### Before Cache (Baseline)
```bash
# Install ab (Apache Bench) if not available
# On Windows: choco install apache-http-server

# 100 requests to get users
ab -n 100 -c 10 http://localhost:3000/api/users

# Note the average response time (should be 50-100ms)
```

### After Cache
```bash
# Same test
ab -n 100 -c 10 http://localhost:3000/api/users

# Response time should be 5-10ms (10x faster!)
```

## Expected Cache Behavior

### Cache Hit Pattern
```
Request 1 -> Redis MISS -> Query DB -> Store in Redis
Request 2 -> Redis HIT -> Return cached
Request 3 -> Redis HIT -> Return cached
... (same response time ~2ms) ...
After TTL expires -> Redis MISS -> Query DB again
```

### Cache Invalidation Pattern
```
GET /api/users -> Redis HIT (cached)
POST /api/appointments -> Creates appointment + invalidates
GET /api/appointments -> Redis MISS -> Query DB (fresh data)
GET /api/users -> Redis HIT (still cached, not affected)
```

## Debugging Cache Issues

### Enable Cache Logging
Add to `lib/cache.ts`:
```typescript
console.log(`[CACHE] ${miss ? 'MISS' : 'HIT'}: ${key}`)
```

### Check if Cache is Working
```bash
# Visit test endpoint (already has logging)
curl http://localhost:3000/api/test-cache

# Check Next.js logs in terminal
# Should show: Cache HIT on second request
```

### Verify Redis Connection
```bash
# In Node.js console
const redis = require('redis')
const client = redis.createClient({ host: 'localhost', port: 6379 })
client.ping((err, reply) => console.log(reply)) // Should print PONG
```

## Common Issues & Solutions

### Issue: Cache always returns MISS
**Solution**: 
- Verify Redis is running: `docker ps | grep redis`
- Check REDIS_URL in .env.local
- Verify no errors in Next.js logs

### Issue: Different data on repeated requests
**Solution**:
- Check TTL - might have expired
- Verify invalidation isn't running unexpectedly
- Check if multiple instances are running

### Issue: Memory keeps growing
**Solution**:
- Reduce TTL values
- Use `FLUSHDB` to clear cache
- Check for unbounded parameterized keys

### Issue: Stale data returned
**Solution**:
- Reduce TTL
- Check if invalidation is working: `KEYS *` before/after mutation
- Manually invalidate: `DEL cache:key`

## Validation Checklist

- [ ] Redis container running (`docker ps`)
- [ ] REDIS_URL configured in .env.local
- [ ] No compilation errors in TypeScript
- [ ] GET endpoints return data
- [ ] Second request faster than first
- [ ] Cache keys visible in Redis: `KEYS *`
- [ ] TTL decreasing over time: `TTL key`
- [ ] POST/PUT/DELETE invalidate related caches
- [ ] Fallback to in-memory if Redis down

## Next: Production Deployment

When ready for production:
1. Use Upstash Redis instead of Docker
2. Update REDIS_URL to Upstash connection string
3. Enable Redis persistence
4. Setup Redis monitoring/alerts
5. Adjust TTLs based on usage patterns
