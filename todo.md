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
- [ ] Execute manual end-to-end testing via Admin UI
- [ ] Verify database records after test scenarios

## Future Enhancements
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
- [ ] Test end-to-end: purchase → earn cashback → use in next purchase


## User Profile Page (NEW)
- [x] Create Profile page component with layout
- [x] Display user information (name, email, login method)
- [x] Display cashback balance card (total earned, total spent, available)
- [x] Display cashback transactions table with filters
- [x] Add navigation to profile page from navbar/menu
- [x] Add logout button in profile page
- [x] Create responsive design for mobile/tablet
- [x] Add loading and error states
