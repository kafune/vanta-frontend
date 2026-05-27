# Caching Strategy for Product Data

## Overview

This document outlines the recommended caching strategy for the VANTA dark fashion store to optimize performance and reduce database load.

## Caching Layers

### 1. **Client-Side Caching**

#### React Query Cache
- **Duration**: 5 minutes default
- **Implementation**: Already configured in `client/src/lib/trpc.ts`
- **Data Cached**:
  - Product listings
  - Product details
  - Categories
  - Search results

```typescript
// Example: Configure React Query cache time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

#### LocalStorage
- **Duration**: Persistent until cleared
- **Data Cached**:
  - Shopping cart
  - User preferences
  - Search history
  - Saved filters

### 2. **Server-Side Caching**

#### In-Memory Cache (Node.js)
- **Duration**: 15 minutes
- **Data Cached**:
  - Product categories
  - Featured products
  - Trending products
  - Promotions

```typescript
// Example: In-memory cache implementation
const cache = new Map<string, { data: any; expiresAt: Date }>();

export function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && new Date() < cached.expiresAt) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedData(key: string, data: any, ttlMs: number) {
  cache.set(key, {
    data,
    expiresAt: new Date(Date.now() + ttlMs),
  });
}
```

#### Redis Cache (Optional)
- **Duration**: 1 hour
- **Data Cached**:
  - Product listings
  - Search results
  - User sessions
  - Analytics data

### 3. **Database Query Optimization**

#### Query Result Caching
- Cache frequently accessed queries
- Invalidate on data updates
- Use database indexes for faster queries

#### Connection Pooling
- Maintain persistent database connections
- Reduce connection overhead
- Improve query performance

## Caching Strategy by Data Type

### Products
- **Cache Duration**: 15 minutes
- **Invalidation**: On product update, stock change
- **Strategy**: Cache at multiple levels (client + server)

```typescript
// Cache key pattern
const productCacheKey = `product:${productId}`;
const productListCacheKey = `products:${category}:${page}`;
```

### Categories
- **Cache Duration**: 1 hour
- **Invalidation**: On category update
- **Strategy**: Long-term server cache

### Search Results
- **Cache Duration**: 5 minutes
- **Invalidation**: On new search, product update
- **Strategy**: Client-side cache with server fallback

### User Data
- **Cache Duration**: Session-based
- **Invalidation**: On logout, user update
- **Strategy**: Session cache with secure storage

### Analytics
- **Cache Duration**: 1 hour
- **Invalidation**: On new data point
- **Strategy**: Aggregated cache with periodic refresh

## Cache Invalidation Strategy

### Event-Based Invalidation
```typescript
// Invalidate cache on product update
async function updateProduct(productId: string, data: any) {
  // Update database
  await db.update(products).set(data).where(eq(products.id, productId));
  
  // Invalidate cache
  cache.delete(`product:${productId}`);
  cache.delete(`products:all`);
  
  // Notify clients
  broadcastCacheInvalidation(`product:${productId}`);
}
```

### Time-Based Invalidation
- Automatic expiration based on TTL
- Periodic refresh of critical data
- Stale-while-revalidate pattern

### Manual Invalidation
- Admin dashboard to clear cache
- Batch cache clearing
- Selective cache invalidation

## Performance Metrics

### Before Caching
- Average response time: 200-500ms
- Database queries per request: 3-5
- Server CPU usage: 60-80%

### After Caching (Expected)
- Average response time: 50-100ms
- Database queries per request: 0-1
- Server CPU usage: 20-40%

## Implementation Checklist

- [ ] Implement in-memory cache for products
- [ ] Implement in-memory cache for categories
- [ ] Add cache invalidation on product updates
- [ ] Implement Redis cache (optional)
- [ ] Add cache statistics dashboard
- [ ] Monitor cache hit rates
- [ ] Optimize cache key generation
- [ ] Implement cache warming strategy
- [ ] Add cache clearing endpoints (admin only)
- [ ] Document cache behavior for developers

## Monitoring & Metrics

### Cache Hit Rate
- Target: 80%+ for product data
- Monitor via cache statistics endpoint
- Alert if hit rate drops below 70%

### Cache Size
- Monitor memory usage
- Implement cache size limits
- Implement LRU eviction policy

### Query Performance
- Track database query times
- Monitor slow queries
- Optimize queries with high latency

## Best Practices

1. **Cache Key Design**: Use consistent, descriptive keys
2. **TTL Configuration**: Balance freshness vs performance
3. **Error Handling**: Gracefully handle cache misses
4. **Security**: Never cache sensitive data
5. **Testing**: Test cache behavior in different scenarios
6. **Documentation**: Document cache invalidation logic
7. **Monitoring**: Track cache metrics and performance
8. **Maintenance**: Regular cache cleanup and optimization

## Future Enhancements

1. **Distributed Caching**: Implement Redis for multi-server setup
2. **Cache Warming**: Pre-load frequently accessed data
3. **Predictive Caching**: Cache data based on user behavior
4. **GraphQL Caching**: Implement Apollo Client caching
5. **CDN Integration**: Cache static assets on CDN
6. **Service Worker**: Implement offline caching

## References

- [Node.js Caching Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Redis Caching Patterns](https://redis.io/docs/manual/client-side-caching/)
