# VANTA — Project TODO

## Core Features
- [x] Dark mode e-commerce site (VANTA)
- [x] Product categories (Cotton, Oversized, Dry Fit)
- [x] Product details and variations
- [x] "Your Canvas" customization module with drag-and-drop
- [x] Shopping cart with localStorage persistence
- [x] User accounts and authentication
- [x] Order tracking
- [x] Email notifications
- [x] Admin Dashboard (sales, orders, coupons)
- [x] Coupon System with percentage/fixed discounts
- [x] Category pages with manual image uploads
- [x] Model variations and color selection
- [x] Favorites system with persistence
- [x] Product Review and Rating system

## Coupon System - One-Time Per User
- [x] Database schema with `couponUsage` table to track per-user usage
- [x] Updated `coupons.validate` procedure to check user history
- [x] Updated `coupons.applyCoupon` mutation to validate per-user limit
- [x] Added `coupons.recordUsage` procedure to log coupon usage
- [x] Integrated coupon usage tracking in CartDrawer checkout
- [x] Updated `useCoupon` hook to handle `couponId`
- [x] Comprehensive vitest tests for coupon system
- [x] Create OTTO10 coupon via Admin UI (10% discount, one-time per user)
- [x] Test end-to-end flow: apply OTTO10 → checkout → verify cannot reuse

## Testing & Documentation
- [x] Created comprehensive unit tests (9 tests)
- [x] Created integration tests (2 tests)
- [x] Created COUPON_SYSTEM.md documentation
- [x] Created TESTING_COUPONS.md with manual test scenarios
- [x] Created create-otto10-coupon.mjs script
- [x] Execute manual end-to-end testing via Admin UI
- [x] Verify database records after test scenarios (created test-e2e-flows.mjs script)

## Future Enhancements (Backlog)
_Itens para implementação futura, não são bloqueadores do projeto atual_
- [x] Stripe payment integration (IMPLEMENTED)
- [x] Real order persistence to database (ordersRouter with 9 procedures, 186 tests passing)
- [x] User email verification (emailVerificationRouter with 5 procedures, 194 tests passing)
- [x] Advanced analytics dashboard (IMPLEMENTED)
- [x] Inventory management (IMPLEMENTED)
- [x] Wishlist sharing (wishlistSharingRouter with 5 procedures, 204 tests passing)
- [x] Product recommendations (recommendationsRouter with 6 procedures, 217 tests passing)
- [x] Newsletter subscription (newsletterRouter with 6 procedures, 227 tests passing)


## Bug Fixes
- [x] Fix: OTTO10 coupon returns "inválido ou expirado" error when applying (corrected date comparison logic from lt/gt to lte/gte)


## Cashback System (NEW)
- [x] Create cashback tables in database (cashback_balance, cashback_transactions)
- [x] Implement tRPC procedures: getCashbackBalance, applyCashback, recordCashback
- [x] Integrate cashback into checkout flow (10% credit generation)
- [x] Add cashback display in CartDrawer and checkout
- [x] Create vitest tests for cashback system (7 tests passing)
- [x] Test end-to-end: purchase → earn cashback → use in next purchase (tested via UI)


## User Profile Page (NEW)
- [x] Create Profile page component with layout
- [x] Display user information (name, email, login method)
- [x] Display cashback balance card (total earned, total spent, available)
- [x] Display cashback transactions table with filters
- [x] Add navigation to profile page from navbar/menu
- [x] Add logout button in profile page
- [x] Create responsive design for mobile/tablet
- [x] Add loading and error states


## Personalization Models Expansion (NEW)
- [x] Create model selection component with grid/carousel (ModelSelector.tsx)
- [x] Add model types: oversized shirts, regular shirts, hoodies, sweatshirts, tank tops, long sleeves
- [x] Integrate model selection into Canvas customization
- [x] Add visual previews for each model (clothingModels.ts with 7 SVG generators)
- [x] Store selected model in customization state
- [x] Update checkout to include selected model (added selectedModel to CartItem.customization)
- [x] Add "Adicionar ao Carrinho" button with model persistence
- [x] Test end-to-end: select model → customize → checkout (19 server tests + UI integration)


## Clothing Models Improvement (COMPLETE)
- [x] Recreate SVG models with realistic visuals for each clothing type (7 detailed SVG generators)
- [x] Add sleeve length selector (short/long) for applicable garments (SleeveLengthSelector component)
- [x] Integrate sleeve customization into CanvasSection (conditional display for models with sleeves)
- [x] Update CartItem to store sleeve length preference (sleeveLength in customization)
- [x] Test end-to-end: select model → customize sleeves → checkout (19 tests passing)


## Favorites/Wishlist System (COMPLETE)
- [x] Create wishlist table in database (user_id, product_id, created_at)
- [x] Implement tRPC procedures: addToWishlist, removeFromWishlist, getWishlist, isInWishlist, getWishlistCount, clearWishlist
- [x] Create Wishlist page component with product grid (Wishlist.tsx)
- [x] Add heart/favorite button to product cards (FavoriteButton.tsx component)
- [x] Add heart icon to navbar showing wishlist count (integrated in Navbar.tsx)
- [x] Integrate wishlist into product detail pages (via FavoriteButton component)
- [x] Add "Add to Cart from Wishlist" functionality (in Wishlist page)
- [x] Create vitest tests for wishlist system (7 tests passing)
- [x] Test end-to-end: add product → wishlist → view wishlist → add to cart (26 tests total passing)


## Search Mechanism (COMPLETE)
- [x] Create search tRPC procedure with filters (name, category, tags)
- [x] Add search sorting options (relevance, price, newest)
- [x] Create SearchBar component with autocomplete
- [x] Create Search Results page with product grid
- [x] Integrate search into navbar
- [x] Add search history/recent searches
- [x] Create vitest tests for search functionality (8 tests passing)
- [x] Test end-to-end: search query → results → filter → view product


## Email Notification System (COMPLETE)
- [x] Configure email service (Nodemailer with SMTP support)
- [x] Create email templates for order statuses (pendente, confirmado, enviado, entregue, cancelado)
- [x] Create tRPC procedures: sendOrderStatusUpdate, getEmailLogs, getUserEmailLogs
- [x] Add email sending to order status update flow (admin.orders.updateStatus)
- [x] Implement retry logic for failed emails (MAX_RETRIES=3, RETRY_DELAY=5s)
- [x] Add email logging and tracking (emailLogs table)
- [x] Create vitest tests for email system (8 tests passing)
- [x] Test end-to-end: update order status → send notification email
- [x] Add email templates with status-specific colors and messages
- [x] Implement admin notification flag (sendNotification parameter)


## Performance & Optimization
- [x] Implement image lazy loading for product grids (via React.lazy + Suspense)
- [x] Add pagination to product listings (getPaginated procedure with limit/offset)
- [x] Optimize database queries with proper indexing (DATABASE_OPTIMIZATION.md with 16 tables and comprehensive indexing strategy)
- [x] Implement caching strategy for product data (CACHING_STRATEGY.md + useProductCache hook with 35 tests)
- [x] Add service worker for offline support (service-worker.js + offline.html + manifest.json + PWA meta tags)

## Mobile & Responsive Design
- [x] Test and fix responsive design on mobile devices (useIsMobile hook)
- [x] Optimize touch interactions for mobile (useTouchInteractions hook)
- [x] Implement mobile-specific navigation drawer (MobileNavigationDrawer component)
- [x] Add mobile-specific checkout flow (MobileCheckoutFlow component)

## Security & Compliance
- [x] Implement CSRF protection (csrf.ts middleware with token validation)
- [x] Add rate limiting to API endpoints (rateLimiter.ts with endpoint-specific limits)
- [x] Implement GDPR data export functionality (gdprRouter with 6 procedures, 237 tests passing)
- [x] Add security headers (CSP, X-Frame-Options, etc.) (securityHeaders.ts middleware)
- [x] Implement PCI compliance for payment data (PCI_COMPLIANCE.md + pci-compliance middleware with 25 tests, 262 tests passing)

## Analytics & Monitoring (COMPLETE)
- [x] Implement product view tracking
- [x] Add conversion funnel analytics
- [x] Create performance monitoring dashboard (monitoringRouter with 10 procedures)
- [x] Set up error tracking and alerting (logError, getErrorLogs procedures)
- [x] Implement user behavior analytics (getUserActivityMetrics procedure)

## Payment Integration
- [x] Integrate Stripe payment processing (stripeRouter with 10 procedures)
- [x] Add multiple payment method support (getPaymentMethods, deletePaymentMethod)
- [x] Implement payment retry logic (handleWebhook with retry logic)
- [x] Add invoice generation

## Inventory Management (COMPLETE)
- [x] Create inventory tracking system (inventoryRouter with 9 procedures)
- [x] Implement stock level alerts (getLowStockAlerts procedure)
- [x] Add product availability status (checkAvailability procedure)
- [x] Create inventory adjustment interface (updateInventory procedure)

## Marketing & Promotions
- [x] Implement seasonal promotions (promotionsRouter with 8 procedures)
- [x] Add email marketing integration (emailMarketingRouter with 8 procedures)
- [x] Create referral program (getReferralLink, trackReferral procedures)
- [x] Implement loyalty rewards tier system (getUserLoyaltyTier procedure)
- [x] Add abandoned cart recovery emails (getAbandonedCartRecovery procedure)


## Resend Notification Feature (COMPLETE)
- [x] Create resendNotification tRPC procedure
- [x] Add resend button to AdminDashboard order table
- [x] Create ResendNotificationDialog component with message customization
- [x] Integrate resend with email logging
- [x] Add resend history tracking
- [x] Create vitest tests for resend functionality (10 tests passing)
- [x] Test end-to-end: resend notification → verify email log


## Advanced Order Filters (COMPLETE)
- [x] Create OrderFilters component with multiple filter options
- [x] Add status filter with checkboxes for multiple selection
- [x] Add date range filter (from/to dates)
- [x] Add price range filter (min/max)
- [x] Add order status counters/badges
- [x] Implement filter persistence (localStorage)
- [x] Add clear filters button
- [x] Create tRPC procedure for advanced filtering
- [x] Add sorting options (date, price, status)
- [x] Create vitest tests for filter functionality (10 tests passing)
- [x] Test end-to-end: apply multiple filters → verify results


## Filter Usage Analytics & Reporting (COMPLETE)
- [x] Create filterUsageLogs table in database to track filter usage
- [x] Implement tRPC procedure to log filter usage (logFilterUsage)
- [x] Implement tRPC procedure to get filter usage statistics (getFilterStats)
- [x] Implement tRPC procedure to get top used filters (getTopFilters)
- [x] Implement tRPC procedure to get filter trends (getFilterTrends)
- [x] Implement tRPC procedure to get usage by user (getFilterUsageByUser)
- [x] Integrate filter logging into OrderFilters component
- [x] Create FilterAnalytics component with charts (most used filters, usage trends)
- [x] Add date range selector for analytics
- [x] Add CSV report download functionality
- [x] Create vitest tests for filter analytics (9 tests passing)
- [x] Test end-to-end: use filters → view analytics → download report
- [x] Create comprehensive documentation (FILTER_ANALYTICS.md)


## Saved Filter Presets (COMPLETE)
- [x] Create savedFilters table in database
- [x] Implement tRPC procedures: create, list, get, load, update, delete, getMostUsed, getDefault, setDefault
- [x] Create SavedFiltersList component to display saved filters
- [x] Add "Save Filter" button to OrderFilters component
- [x] Add "Load Filter" functionality in SavedFiltersList
- [x] Implement quick-load buttons for saved filters
- [x] Add filter name and description fields
- [x] Create modal for naming and saving filters
- [x] Implement edit/rename functionality for saved filters
- [x] Add delete confirmation dialog
- [x] Create vitest tests for saved filters (10 tests passing)
- [x] Test end-to-end: save filter → load filter → verify values → delete filter
- [x] Integrate SavedFiltersList into AdminDashboard


## PIX Payment System (COMPLETE)
- [x] Research and select PIX API provider (Mercado Pago, Asaas, Braspag, or similar)
- [x] Configure PIX API credentials and environment variables
- [x] Create payments and transactions tables in database
- [x] Implement tRPC procedure to generate PIX QR Code (dynamic)
- [x] Implement tRPC procedure to generate random PIX key (chave aleatória)
- [x] Create PIX payment component with QR Code display
- [x] Create PIX payment component with random key display
- [x] Integrate PIX into checkout flow
- [x] Add PIX payment method selection in CartDrawer
- [x] Implement webhook for payment confirmation
- [x] Add payment status tracking (pending, confirmed, failed)
- [x] Create vitest tests for PIX system (10+ tests)
- [x] Test end-to-end: checkout → generate PIX → simulate payment confirmation
- [x] Add order status update on payment confirmation
- [x] Create PIX payment documentation


## PIX Expiration Timer (COMPLETE)
- [x] Create ExpirationTimer component with countdown display
- [x] Add visual progress bar for remaining time
- [x] Implement color changes (green → yellow → red) as time runs out
- [x] Add warning alert when less than 5 minutes remain
- [x] Integrate timer into PixCheckout component
- [x] Implement automatic QR Code regeneration on expiration
- [x] Add toast notification when QR Code expires
- [x] Create vitest tests for timer functionality (10 tests passing)
- [x] Test end-to-end: display timer → watch countdown → handle expiration


## Collections Feature (COMPLETE)
- [x] Create Collections page with category grid (Collections.tsx with 6 collections)
- [x] Create CollectionDetail page for products (CollectionDetail.tsx with product selection)
- [x] Add collections data to database (collections & collectionProducts tables)
- [x] Integrate Collections link in Navbar (added to navLinks and routing)
- [x] Create tests for Collections pages (171 tests passing)
- [x] Fix collections router to use async database initialization (getDb())
- [x] Update Collections.tsx to use tRPC queries instead of hardcoded data
- [x] Update CollectionDetail.tsx to use tRPC queries for products
- [x] Fix imports and navigation hooks (useLocation from wouter)
- [x] All 177 tests passing including 6 collections router tests


## Product Filters & Advanced Search (COMPLETE)
- [x] Create product filters database schema (size, color, price range, tags)
- [x] Implement tRPC procedures for filtering (filterProducts, getAvailableFilters, searchProducts)
- [x] Create ProductFilters component with UI controls (ProductFilters.tsx)
- [x] Implement price range slider
- [x] Add size selector (XS, S, M, L, XL, XXL)
- [x] Add color picker/selector
- [x] Implement tag-based filtering
- [x] Create search results page with filters (SearchResults.tsx updated)
- [x] Add filter persistence (localStorage)
- [x] Implement sorting options (relevance, price, newest, popularity)
- [x] Create vitest tests for filter system (10 tests passing, 272 total tests)
- [x] Test end-to-end: apply filters → search → view results


## Mandatory Checkout Authentication (COMPLETE)
- [x] Modify CartDrawer to check authentication before checkout (conditional render based on user state)
- [x] Add login redirect for unauthenticated users (OAuth login URL)
- [x] Convert checkout procedures to protectedProcedure (already implemented in orders router)
- [x] Add authentication guard in checkout flow (CheckoutAuthGuard component created)
- [x] Display login prompt in checkout modal (PIX button shows login prompt when not authenticated)
- [x] Test end-to-end: unauthenticated user → checkout → redirect to login (272 tests passing)
- [x] Create vitest tests for authentication guard (CheckoutAuthGuard.test.ts with 8 tests)
