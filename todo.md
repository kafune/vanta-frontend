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
- [ ] Create OTTO10 coupon via Admin UI (10% discount, one-time per user)
- [ ] Test end-to-end flow: apply OTTO10 → checkout → verify cannot reuse

## Future Enhancements
- [ ] Stripe payment integration
- [ ] Real order persistence to database
- [ ] User email verification
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Wishlist sharing
- [ ] Product recommendations
- [ ] Newsletter subscription
