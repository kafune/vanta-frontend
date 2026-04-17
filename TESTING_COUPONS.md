# Testing VANTA Coupon System — One-Time Per User

## Quick Start

### 1. Create OTTO10 Coupon

Choose one of the following methods:

#### Option A: Via Admin Dashboard (Recommended)

1. Navigate to `https://darkfashn-ljqd3zro.manus.space/admin` (or your local dev URL)
2. Log in as an admin user
3. Click the "Cupons" tab
4. Fill in the form:
   - **Código:** `OTTO10`
   - **Desconto (%):** `10`
5. Click "Criar"

The coupon will be created with:
- Discount: 10%
- Valid for 30 days
- Unlimited global uses (but one per user)
- Active immediately

#### Option B: Via Script (For Development)

```bash
cd /home/ubuntu/dark-fashion-store
node scripts/create-otto10-coupon.mjs
```

This script will:
- Check if OTTO10 already exists
- Create it if missing
- Display confirmation with coupon details

### 2. Run Unit & Integration Tests

```bash
pnpm test
```

Expected output:
```
 ✓ server/routers/coupons.integration.test.ts (2 tests)
 ✓ server/routers/coupons.test.ts (9 tests)
 ✓ server/auth.logout.test.ts (1 test)
 Test Files  3 passed (3)
      Tests  12 passed (12)
```

Tests cover:
- Coupon validation
- Per-user usage enforcement
- Discount calculation
- Usage recording
- Multi-user scenarios

### 3. Manual End-to-End Testing

#### Test Scenario 1: First Use Succeeds

1. **Login as User A**
   - Navigate to home page
   - Click login button
   - Complete authentication

2. **Add items to cart**
   - Browse products
   - Add 2-3 items to cart

3. **Apply OTTO10 coupon**
   - Open cart drawer
   - Enter code: `OTTO10`
   - Click "Aplicar"
   - **Expected:** "✓ Cupom aplicado" message
   - **Expected:** Discount shows 10% of subtotal
   - **Expected:** Total is reduced

4. **Complete checkout**
   - Click "Checkout" button
   - **Expected:** Order confirmation page
   - **Expected:** Email sent (check console for email logs)

#### Test Scenario 2: Second Use Blocked

1. **Still logged in as User A**
2. **Add new items to cart**
3. **Try to apply OTTO10 again**
   - Enter code: `OTTO10`
   - Click "Aplicar"
   - **Expected:** Error message: "Você já utilizou este cupom"
   - **Expected:** Coupon input remains empty

#### Test Scenario 3: Different User Can Use

1. **Logout from User A**
   - Click account menu
   - Click "Logout"

2. **Login as User B**
   - Complete authentication as different user

3. **Add items to cart**

4. **Apply OTTO10 coupon**
   - Enter code: `OTTO10`
   - Click "Aplicar"
   - **Expected:** "✓ Cupom aplicado" message
   - **Expected:** Discount applied successfully
   - **Note:** Works because User B hasn't used OTTO10 yet

5. **Complete checkout**
   - Click "Checkout"
   - **Expected:** Order confirmation

#### Test Scenario 4: Verify Database Records

After completing scenarios 1-3, verify database:

```sql
-- Check coupon details
SELECT id, code, currentUses, maxUses, isActive 
FROM coupons 
WHERE code = 'OTTO10';

-- Check usage records
SELECT cu.id, cu.userId, cu.orderId, cu.usedAt, u.name
FROM couponUsage cu
JOIN users u ON cu.userId = u.id
WHERE cu.couponId = (SELECT id FROM coupons WHERE code = 'OTTO10')
ORDER BY cu.usedAt DESC;
```

**Expected results:**
- `coupons.currentUses` = 2 (User A + User B)
- `couponUsage` has 2 records (one per user)
- Each record has different `userId` but same `couponId`

## Test Cases Coverage

### Unit Tests (9 tests in `coupons.test.ts`)

| Test | Purpose | Status |
|------|---------|--------|
| Validate invalid coupon | Returns error for non-existent code | ✅ |
| Validate user already used | Blocks reuse by authenticated user | ✅ |
| Validate new user | Allows first-time use | ✅ |
| Validate unauthenticated | Allows unauthenticated access | ✅ |
| Apply coupon throws on reuse | Mutation fails for repeat user | ✅ |
| Calculate percentage discount | Math is correct (10% of 10000 = 1000) | ✅ |
| Increment usage count | Global counter increments | ✅ |
| Record usage requires auth | Mutation fails without user | ✅ |
| Record usage succeeds | Creates entry in couponUsage table | ✅ |

### Integration Tests (2 tests in `coupons.integration.test.ts`)

| Test | Purpose | Status |
|------|---------|--------|
| Complete lifecycle | User 1 applies → records → blocked on reuse; User 2 applies separately | ✅ |
| Multi-user independence | Multiple users tracked independently despite global usage count | ✅ |

## Troubleshooting

### "Cupom inválido ou expirado"

**Causes:**
- Coupon code doesn't exist
- Coupon is outside validity period
- Coupon is inactive

**Solution:**
- Verify OTTO10 exists: check Admin Dashboard → Cupons tab
- Check validity dates: should show "Valid until: [future date]"
- Ensure "Status" shows "Ativo" (Active)

### "Você já utilizou este cupom"

**Causes:**
- You (the logged-in user) already used this coupon
- Coupon usage was recorded in a previous order

**Solution:**
- This is expected behavior! Test with a different user account
- Or wait for coupon to expire (if you want to test expiration)

### "Cupom atingiu o limite de uso"

**Causes:**
- Global usage limit reached (if `maxUses` was set)

**Solution:**
- OTTO10 has unlimited global uses, so this shouldn't happen
- If it does, check `coupons.maxUses` value in database

### Coupon not appearing in Admin list

**Causes:**
- Admin user doesn't have permission
- Coupon creation failed silently

**Solution:**
- Verify you're logged in as admin (check user role in database)
- Check browser console for errors
- Run script: `node scripts/create-otto10-coupon.mjs`

## Performance Notes

- Coupon validation adds 1-2 database queries per apply
- Usage recording adds 1 insert per checkout
- No N+1 queries (each operation is optimized)
- Suitable for high-traffic scenarios

## Security Notes

- All validation happens server-side
- Client cannot bypass per-user limits
- Usage records are immutable (audit trail)
- Admin-only coupon creation
- User authentication required for per-user limits
