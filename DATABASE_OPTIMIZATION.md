# Database Optimization Guide

## Indexing Strategy

This document outlines the recommended database indexing strategy for the VANTA dark fashion store to optimize query performance.

### Current Tables and Recommended Indexes

#### 1. **users** table
- **Primary Key**: `id` (already indexed)
- **Unique Index**: `openId` (already indexed)
- **Recommended Indexes**:
  - `email`: For user lookups by email during authentication and verification
  - `role`: For admin queries and role-based filtering
  - `createdAt`: For user analytics and reporting

#### 2. **orders** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For fetching user's order history (frequently queried)
  - `status`: For order status filtering and reporting
  - `createdAt`: For time-based queries and analytics
  - **Composite Index**: `(userId, createdAt DESC)` for efficient user order history retrieval

#### 3. **orderItems** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `orderId`: For fetching order items (frequently joined with orders)
  - `productId`: For product analytics and inventory tracking
  - **Composite Index**: `(orderId, createdAt)` for efficient order detail retrieval

#### 4. **products** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `category`: For category filtering and browsing
  - `price`: For price range filtering
  - `rating`: For sorting by rating
  - `views`: For trending products
  - `sold`: For best sellers
  - `createdAt`: For new arrivals
  - **Composite Index**: `(category, rating DESC)` for category browsing

#### 5. **wishlist** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For fetching user's wishlist
  - `productId`: For product wishlist counts
  - **Composite Index**: `(userId, productId)` for duplicate checking

#### 6. **reviews** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `productId`: For fetching product reviews
  - `userId`: For user's review history
  - `orderId`: For verified purchase reviews
  - `status`: For review moderation
  - **Composite Index**: `(productId, status, rating DESC)` for product review display

#### 7. **coupons** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `code`: For coupon validation (should be unique)
  - `status`: For active/inactive coupon filtering
  - `expiresAt`: For expired coupon cleanup

#### 8. **cashback_balance** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For user cashback lookups
  - `updatedAt`: For recent transactions

#### 9. **cashback_transactions** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For user transaction history
  - `type`: For transaction filtering
  - `createdAt`: For date-based queries

#### 10. **emailLogs** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `orderId`: For order-related email tracking
  - `userId`: For user email history
  - `status`: For failed email identification
  - `createdAt`: For log cleanup and analytics

#### 11. **collections** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `displayOrder`: For collection sorting
  - `createdAt`: For new collections

#### 12. **collectionProducts** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `collectionId`: For fetching collection products
  - `productId`: For product-to-collection mapping
  - **Composite Index**: `(collectionId, displayOrder)` for collection browsing

#### 13. **savedFilters** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For user's saved filters
  - `createdAt`: For recent filters

#### 14. **promotions** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `status`: For active promotions
  - `startDate`, `endDate`: For time-based filtering
  - **Composite Index**: `(status, startDate, endDate)` for active promotion queries

#### 15. **pixTransactions** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For user transaction history
  - `status`: For payment status tracking
  - `createdAt`: For transaction history

#### 16. **stripePayments** table
- **Primary Key**: `id` (already indexed)
- **Recommended Indexes**:
  - `userId`: For user payment history
  - `status`: For payment status tracking
  - `createdAt`: For transaction history

### Query Optimization Patterns

#### 1. User Queries
```sql
-- Frequently used queries
SELECT * FROM users WHERE email = ?;
SELECT * FROM users WHERE openId = ?;
SELECT * FROM users WHERE role = 'admin';
```

#### 2. Order Queries
```sql
-- Frequently used queries
SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC;
SELECT * FROM orders WHERE status = ?;
SELECT * FROM orderItems WHERE orderId = ?;
```

#### 3. Product Queries
```sql
-- Frequently used queries
SELECT * FROM products WHERE category = ? ORDER BY rating DESC;
SELECT * FROM products ORDER BY views DESC LIMIT 10;
SELECT * FROM products WHERE price BETWEEN ? AND ? ORDER BY price;
```

#### 4. Wishlist Queries
```sql
-- Frequently used queries
SELECT * FROM wishlist WHERE userId = ?;
SELECT COUNT(*) FROM wishlist WHERE userId = ? AND productId = ?;
```

### Index Implementation

To implement these indexes, add them to the Drizzle schema using the `index()` function:

```typescript
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", [...]).default("pendente").notNull(),
  totalPrice: int("totalPrice").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_orders_userId").on(table.userId),
  statusIdx: index("idx_orders_status").on(table.status),
  createdAtIdx: index("idx_orders_createdAt").on(table.createdAt),
  userCreatedIdx: index("idx_orders_userId_createdAt").on(table.userId, table.createdAt),
}));
```

### Performance Monitoring

After implementing indexes, monitor query performance using:

1. **MySQL EXPLAIN**: Analyze query execution plans
   ```sql
   EXPLAIN SELECT * FROM orders WHERE userId = 1 ORDER BY createdAt DESC;
   ```

2. **Slow Query Log**: Enable and monitor slow queries
   ```sql
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

3. **Database Metrics**: Monitor in the Manus dashboard
   - Query execution time
   - Index usage statistics
   - Table scan rates

### Maintenance Tasks

1. **Regular Index Maintenance**
   - Rebuild fragmented indexes monthly
   - Remove unused indexes quarterly

2. **Statistics Update**
   - Update table statistics after bulk operations
   - Run `ANALYZE TABLE` on frequently modified tables

3. **Query Optimization**
   - Review slow query logs monthly
   - Optimize queries with poor execution plans
   - Consider additional indexes for frequently slow queries

### Caching Strategy

Implement caching layers to reduce database load:

1. **Query Result Caching**: Cache frequently accessed data (products, categories)
2. **Session Caching**: Cache user session data
3. **Computed Value Caching**: Cache aggregated values (ratings, review counts)

### Next Steps

1. Add indexes to the Drizzle schema
2. Run `pnpm db:push` to apply migrations
3. Monitor query performance using EXPLAIN
4. Adjust indexes based on actual query patterns
5. Implement caching for high-traffic queries
