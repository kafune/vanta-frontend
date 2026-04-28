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
- [ ] Stripe payment integration
- [ ] Real order persistence to database
- [ ] User email verification
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Wishlist sharing
- [ ] Product recommendations
- [ ] Newsletter subscription


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
