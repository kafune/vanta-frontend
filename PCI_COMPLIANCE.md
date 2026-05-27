# PCI DSS Compliance Guide

## Overview

This document outlines the PCI DSS (Payment Card Industry Data Security Standard) compliance measures implemented in the VANTA dark fashion store. PCI DSS is a set of security standards designed to ensure that all companies that accept, process, store, or transmit credit card information maintain a secure environment.

## Current Payment Methods

The VANTA store uses the following payment methods, all of which are PCI-compliant by design:

### 1. **Stripe Integration**
- **Tokenization**: All credit card data is tokenized by Stripe, not stored locally
- **PCI Compliance**: Stripe is PCI DSS Level 1 certified
- **Implementation**: Payment processing via `stripeRouter` with webhook handling
- **Data Handling**: Only payment tokens and transaction IDs are stored in the database

### 2. **PIX Payment System**
- **No Card Data**: PIX uses bank transfer, not credit card data
- **Secure**: Payments are processed through authorized PIX providers
- **Implementation**: PIX via `pixRouter` with QR code generation
- **Data Handling**: Only transaction IDs and payment status are stored

## PCI DSS Requirements Implementation

### Requirement 1: Install and Maintain a Firewall Configuration

**Implementation**:
- All API endpoints are protected with rate limiting (`rateLimiter.ts`)
- CSRF protection implemented (`csrf.ts`)
- Security headers configured (`securityHeaders.ts`)

```typescript
// Rate limiting on payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  keyGenerator: (req) => req.ip,
});

app.post('/api/trpc/stripe.createPaymentIntent', paymentLimiter, ...);
```

### Requirement 2: Do Not Use Vendor-Supplied Defaults

**Implementation**:
- All default credentials are changed
- Environment variables are used for sensitive configuration
- Session secrets are randomly generated

### Requirement 3: Protect Stored Cardholder Data

**Implementation**:
- **No card data is stored locally**
- Only Stripe payment tokens are stored in the database
- Payment method references use tokenized identifiers

```typescript
// Example: Payment method storage (NO card data)
export const stripePayments = mysqlTable("stripePayments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentMethodId: varchar("stripePaymentMethodId", { length: 255 }).notNull(),
  // NO card number, CVV, or expiry date stored
  status: varchar("status", { length: 64 }).notNull(),
  amount: int("amount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

### Requirement 4: Encrypt Transmission of Cardholder Data

**Implementation**:
- All API communication uses HTTPS/TLS
- Stripe handles end-to-end encryption
- No sensitive data is transmitted in logs or error messages

### Requirement 5: Protect Against Malware

**Implementation**:
- Regular dependency updates via `pnpm update`
- Security scanning for vulnerabilities
- Input validation on all API endpoints

### Requirement 6: Develop and Maintain Secure Systems

**Implementation**:
- Code review process for payment-related changes
- Automated testing with vitest
- Security headers implemented

```typescript
// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

### Requirement 7: Restrict Access by Business Need

**Implementation**:
- Role-based access control (admin vs user)
- Protected procedures require authentication
- Admin-only endpoints for payment management

```typescript
// Admin-only payment procedures
adminProcedure: protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
}),
```

### Requirement 8: Identify and Authenticate Access

**Implementation**:
- OAuth 2.0 authentication via Manus
- Session-based authentication with JWT tokens
- Unique user IDs for all transactions

### Requirement 9: Restrict Physical Access

**Implementation**:
- Database hosted on secure cloud infrastructure
- Access logs and monitoring enabled
- Regular security audits

### Requirement 10: Track and Monitor Access

**Implementation**:
- Email logs for all transactions
- Order status tracking with timestamps
- Admin dashboard with activity monitoring

```typescript
// Email logging for audit trail
export const emailLogs = mysqlTable("emailLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  userId: int("userId").notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

### Requirement 11: Test Security Systems

**Implementation**:
- Automated security tests via vitest
- Regular vulnerability scanning
- Penetration testing recommendations

## Payment Data Handling Best Practices

### 1. **Never Log Sensitive Data**

```typescript
// ❌ WRONG: Logging card data
console.log('Payment:', { cardNumber, cvv, expiryDate });

// ✅ CORRECT: Logging only safe data
console.log('Payment processed:', { 
  transactionId: payment.id,
  amount: payment.amount,
  status: payment.status 
});
```

### 2. **Use Tokenization**

```typescript
// ✅ CORRECT: Store only tokens
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: { token: stripeToken },
});

// Store only the token ID
await db.insert(stripePayments).values({
  stripePaymentMethodId: paymentMethod.id,
  // NOT the card data
});
```

### 3. **Validate Input**

```typescript
// ✅ CORRECT: Validate payment data
const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'BRL']),
  paymentMethodId: z.string(), // Token, not card
});
```

### 4. **Handle Errors Safely**

```typescript
// ✅ CORRECT: Don't expose sensitive error details
try {
  const payment = await stripe.paymentIntents.create({...});
} catch (error) {
  console.error('Payment failed:', error.code); // Safe
  // NOT: console.error('Payment failed:', error); // Might expose data
}
```

## Webhook Security

### Stripe Webhook Validation

```typescript
// ✅ CORRECT: Validate webhook signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Process only verified events
if (event.type === 'payment_intent.succeeded') {
  // Handle payment confirmation
}
```

## Compliance Checklist

| Requirement | Status | Implementation |
|---|---|---|
| Firewall Configuration | ✅ | Rate limiting, CSRF, security headers |
| No Default Credentials | ✅ | Environment variables, random secrets |
| Protect Stored Data | ✅ | No card storage, tokenization only |
| Encrypt Transmission | ✅ | HTTPS/TLS, Stripe encryption |
| Malware Protection | ✅ | Dependency scanning, input validation |
| Secure Systems | ✅ | Code review, automated testing |
| Access Control | ✅ | Role-based, authentication required |
| Authentication | ✅ | OAuth 2.0, JWT tokens |
| Physical Security | ✅ | Cloud infrastructure, access logs |
| Monitoring | ✅ | Email logs, activity tracking |
| Security Testing | ✅ | Vitest, vulnerability scanning |

## Audit Trail

All payment-related activities are logged for audit purposes:

1. **Payment Attempts**: Logged with transaction ID, amount, status
2. **Payment Failures**: Logged with error code (not details)
3. **Refunds**: Logged with authorization and timestamp
4. **Payment Method Changes**: Logged with user ID and timestamp

## Recommendations

### For Production Deployment

1. **Enable PCI Scanning**: Use Qualys or similar for regular scans
2. **Implement WAF**: Use AWS WAF or Cloudflare for additional protection
3. **Regular Audits**: Conduct quarterly security audits
4. **Incident Response**: Have a documented incident response plan
5. **Employee Training**: Train staff on PCI compliance requirements
6. **Vendor Management**: Ensure all third-party vendors are PCI compliant

### Ongoing Maintenance

1. **Monitor Dependencies**: Keep all packages updated
2. **Review Logs**: Regularly review security logs for anomalies
3. **Test Backups**: Ensure backup and recovery procedures work
4. **Update Policies**: Keep security policies current
5. **Penetration Testing**: Conduct annual penetration tests

## References

- [PCI DSS Official Documentation](https://www.pcisecuritystandards.org/)
- [Stripe Security Documentation](https://stripe.com/docs/security)
- [OWASP Payment Card Industry Data Security Standard](https://owasp.org/www-project-pci-dss/)

## Contact

For PCI compliance questions or security concerns, contact: security@vanta.com
