import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** Hash da senha (scrypt) para login local. Null em usuários OAuth/Manus. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Orders table
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pendente", "confirmado", "enviado", "entregue", "cancelado"]).default("pendente").notNull(),
  totalPrice: int("totalPrice").notNull(), // in cents
  trackingNumber: varchar("trackingNumber", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items table
export const orderItems = mysqlTable("orderItems", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  productName: text("productName").notNull(),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // in cents
  color: varchar("color", { length: 64 }),
  size: varchar("size", { length: 10 }),
  /** URL da estampa personalizada enviada pelo cliente (self-hosted em /uploads). */
  customImageUrl: varchar("customImageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Email logs table for tracking notifications
export const emailLogs = mysqlTable("emailLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  emailType: mysqlEnum("emailType", ["order_confirmation", "order_shipped", "order_delivered", "status_update"]).notNull(),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  subject: text("subject"),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

// Reviews table
export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  verified: int("verified").default(0).notNull(), // 0 or 1
  helpful: int("helpful").default(0).notNull(),
  unhelpful: int("unhelpful").default(0).notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
// Coupons table
export const coupons = mysqlTable("coupons", {
  id: varchar("id", { length: 64 }).primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(),
  minPurchaseAmount: int("minPurchaseAmount").default(0).notNull(),
  maxUses: int("maxUses"),
  currentUses: int("currentUses").default(0).notNull(),
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// Coupon usage tracking table
export const couponUsage = mysqlTable("couponUsage", {
  id: varchar("id", { length: 64 }).primaryKey(),
  couponId: varchar("couponId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type CouponUsage = typeof couponUsage.$inferSelect;
export type InsertCouponUsage = typeof couponUsage.$inferInsert;

// Cashback balance table - tracks available cashback credit per user
export const cashbackBalance = mysqlTable("cashbackBalance", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().unique(), // One balance per user
  totalEarned: int("totalEarned").default(0).notNull(), // Total cashback earned in cents
  totalSpent: int("totalSpent").default(0).notNull(), // Total cashback spent in cents
  availableBalance: int("availableBalance").default(0).notNull(), // totalEarned - totalSpent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CashbackBalance = typeof cashbackBalance.$inferSelect;
export type InsertCashbackBalance = typeof cashbackBalance.$inferInsert;

// Cashback transactions table - audit trail of cashback activity
export const cashbackTransactions = mysqlTable("cashbackTransactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["earned", "spent"]).notNull(), // earned from purchase or spent as discount
  amount: int("amount").notNull(), // in cents
  description: text("description"), // e.g., "Earned 10% cashback from order #123"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashbackTransaction = typeof cashbackTransactions.$inferSelect;
export type InsertCashbackTransaction = typeof cashbackTransactions.$inferInsert;


// Wishlist table - user's favorite items
export const wishlist = mysqlTable("wishlist", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  productName: text("productName").notNull(),
  productImage: text("productImage"),
  productPrice: int("productPrice").notNull(), // in cents
  productCategory: varchar("productCategory", { length: 64 }),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;


// Filter usage logs table - track admin filter usage for analytics
export const filterUsageLogs = mysqlTable("filterUsageLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  filterType: varchar("filterType", { length: 64 }).notNull(), // "status", "date", "price", "sort"
  filterValue: text("filterValue"), // JSON string of filter values
  resultsCount: int("resultsCount").default(0), // number of results returned
  duration: int("duration").default(0), // time spent in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FilterUsageLog = typeof filterUsageLogs.$inferSelect;
export type InsertFilterUsageLog = typeof filterUsageLogs.$inferInsert;


// Saved filter presets table - store frequently used filter combinations
export const savedFilters = mysqlTable("savedFilters", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Pedidos Pendentes"
  description: text("description"), // optional description
  filterData: text("filterData").notNull(), // JSON string of filter values
  isDefault: tinyint("isDefault").default(0), // mark as default filter (0 or 1)
  usageCount: int("usageCount").default(0), // track how many times this filter is used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;


// PIX Payments table - store PIX payment transactions
export const pixPayments = mysqlTable("pixPayments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // in cents
  pixKey: varchar("pixKey", { length: 255 }).notNull(), // PIX key used
  qrCode: text("qrCode").notNull(), // QR code data (base64 or string)
  brCode: text("brCode").notNull(), // BR Code for PIX
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // QR code expiration time
  confirmedAt: timestamp("confirmedAt"), // when payment was confirmed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PixPayment = typeof pixPayments.$inferSelect;
export type InsertPixPayment = typeof pixPayments.$inferInsert;

// PIX Transactions log - track all PIX payment attempts
export const pixTransactions = mysqlTable("pixTransactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  pixPaymentId: varchar("pixPaymentId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  message: text("message"), // error or success message
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PixTransaction = typeof pixTransactions.$inferSelect;
export type InsertPixTransaction = typeof pixTransactions.$inferInsert;


// Collections table - store product collections
export const collections = mysqlTable("collections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  featured: tinyint("featured").default(0).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

// Products table - catálogo de produtos (id é um slug, ex.: "essential-tee-280g",
// para casar com productId já usado em orderItems, wishlist, reviews e collectionProducts).
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // em centavos
  originalPrice: int("originalPrice"), // em centavos, nullable (preço "de")
  tag: varchar("tag", { length: 64 }), // Bestseller, Novo, Promoção...
  image: varchar("image", { length: 500 }), // imagem principal (URL)
  images: text("images"), // JSON array de URLs adicionais
  sizes: text("sizes"), // JSON array, ex.: ["P","M","G","GG"]
  colors: text("colors"), // JSON array de nomes de cor
  featured: tinyint("featured").default(0).notNull(),
  active: tinyint("active").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Addresses table - endereços de entrega por usuário
export const addresses = mysqlTable("addresses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 100 }), // "Casa", "Trabalho"
  recipient: varchar("recipient", { length: 255 }),
  street: varchar("street", { length: 255 }).notNull(),
  number: varchar("number", { length: 32 }),
  complement: varchar("complement", { length: 255 }),
  city: varchar("city", { length: 128 }).notNull(),
  state: varchar("state", { length: 64 }),
  zipCode: varchar("zipCode", { length: 20 }),
  isDefault: tinyint("isDefault").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

// Settings table - configurações da loja (chave/valor)
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// Collection products table - link products to collections
export const collectionProducts = mysqlTable("collectionProducts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  collectionId: varchar("collectionId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollectionProduct = typeof collectionProducts.$inferSelect;
export type InsertCollectionProduct = typeof collectionProducts.$inferInsert;
