# VANTA Coupon System — One-Time Per User

## Overview

The VANTA e-commerce platform now includes a comprehensive coupon system that enforces one-time usage per authenticated user. This ensures that promotional coupons can be limited to specific users and prevent abuse.

## Architecture

### Database Schema

The system uses three related tables:

1. **coupons** — Stores coupon definitions with global usage tracking
   - `id`: Unique coupon identifier
   - `code`: Coupon code (e.g., "OTTO10")
   - `discountType`: "percentage" or "fixed"
   - `discountValue`: Discount amount (percentage or cents)
   - `minPurchaseAmount`: Minimum cart total required
   - `maxUses`: Global usage limit (null = unlimited)
   - `currentUses`: Current global usage count
   - `validFrom` / `validUntil`: Validity period
   - `isActive`: Activation flag

2. **couponUsage** — Tracks per-user coupon usage
   - `id`: Unique usage record identifier
   - `couponId`: Reference to coupon
   - `userId`: User who used the coupon
   - `orderId`: Order where coupon was applied
   - `usedAt`: Timestamp of usage

### tRPC Procedures

#### `coupons.validate` (Query)

Validates if a coupon code is valid and available for the current user.

**Input:**
```typescript
{ code: string }
```

**Output:**
```typescript
{
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    description?: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minPurchaseAmount: number;
  };
}
```

**Validation Checks:**
- Coupon code exists and is active
- Coupon is within valid date range
- Global usage limit not reached (if set)
- **User has not already used this coupon** (if authenticated)

#### `coupons.applyCoupon` (Mutation)

Applies a coupon to the cart and calculates the discount.

**Input:**
```typescript
{
  code: string;
  cartTotal: number; // in cents
}
```

**Output:**
```typescript
{
  success: boolean;
  discount: number; // in cents
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponId: string;
}
```

**Side Effects:**
- Increments global `currentUses` count for the coupon
- Does NOT record per-user usage (see `recordUsage`)

#### `coupons.recordUsage` (Mutation)

Records that a specific user has used a coupon for an order.

**Input:**
```typescript
{
  couponId: string;
  orderId: string;
}
```

**Output:**
```typescript
{ success: boolean }
```

**Requirements:**
- User must be authenticated
- Creates entry in `couponUsage` table

## Frontend Integration

### useCoupon Hook

The `useCoupon` hook manages coupon state on the client:

```typescript
const {
  appliedCoupon,      // Current applied coupon with discount info
  error,              // Error message if validation fails
  loading,            // Loading state during application
  handleApplyCoupon,  // Apply coupon to cart
  removeCoupon,       // Remove applied coupon
} = useCoupon();
```

**AppliedCoupon Structure:**
```typescript
{
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discount: number;     // Calculated discount in cents
  couponId?: string;    // ID for recording usage
}
```

### CartDrawer Integration

When checkout is completed:

1. User applies coupon via `handleApplyCoupon(code, cartTotal)`
2. Coupon is validated and discount calculated
3. On successful checkout:
   - Order is created
   - `trpc.coupons.recordUsage` is called with `couponId` and `orderId`
   - Coupon is removed from cart state
   - User is redirected to success page

## Creating the OTTO10 Coupon

### Via Admin Dashboard

1. Navigate to `/admin` (requires admin role)
2. Go to "Cupons" tab
3. Fill in the form:
   - **Código:** OTTO10
   - **Desconto (%):** 10
4. Click "Criar"

The system will automatically set:
- Discount type: percentage
- Valid from: today
- Valid until: 30 days from now
- Active: yes
- Global limit: unlimited

### Via tRPC (Programmatic)

```typescript
const result = await trpc.admin.coupons.create.mutate({
  code: "OTTO10",
  description: "Desconto de 10% - Uma única vez por usuário",
  discountType: "percentage",
  discountValue: 10,
  minPurchaseAmount: 0,
  validFrom: new Date(),
  validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
});
```

## Testing the System

### Unit Tests

Run comprehensive vitest suite:

```bash
pnpm test
```

Tests cover:
- Coupon validation for valid/invalid codes
- Per-user usage enforcement
- Discount calculation (percentage and fixed)
- Global usage limit enforcement
- Usage recording

### Manual E2E Testing

1. **Create OTTO10 coupon** via Admin Dashboard
2. **Login as User A**
3. **Apply OTTO10 coupon** to cart
   - Should show: "✓ Cupom aplicado" with 10% discount
4. **Complete checkout**
   - Order created
   - Coupon usage recorded in database
5. **Try to apply OTTO10 again**
   - Should show error: "Você já utilizou este cupom"
6. **Logout and login as User B**
7. **Apply OTTO10 coupon** to cart
   - Should work (different user)
   - Shows 10% discount
8. **Verify database**
   - Check `couponUsage` table has entries for both users
   - Check `coupons.currentUses` incremented twice

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Cupom inválido ou expirado" | Code doesn't exist or outside validity period | Check coupon code and dates |
| "Cupom atingiu o limite de uso" | Global usage limit reached | Create new coupon or increase limit |
| "Você já utilizou este cupom" | User already used this coupon | User must use different coupon |
| "Compra mínima de R$ X necessária" | Cart total below minimum | Add more items to cart |

## Security Considerations

1. **User Authentication Required** — Per-user limits only apply to authenticated users
2. **Server-Side Validation** — All coupon logic runs on server (cannot be bypassed client-side)
3. **Immutable Records** — Usage records in `couponUsage` are never deleted (audit trail)
4. **Admin-Only Creation** — Only admin users can create/modify coupons

## Future Enhancements

- Coupon categories (seasonal, loyalty, referral, etc.)
- Usage limits per coupon type
- Coupon stacking rules
- Automatic coupon suggestions based on cart
- Coupon expiration notifications
- Usage analytics and reporting
