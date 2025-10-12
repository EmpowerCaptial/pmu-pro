# Commission & Gratuity Payment System

## Overview

PMU Pro implements a fair and transparent payment system that properly handles commission-based compensation while ensuring that gratuity (tips) are handled fairly.

## Key Principle: Gratuity Always Goes 100% to Staff

**IMPORTANT**: For commissioned employees, gratuity/tips are NEVER split with the studio owner. Tips always go 100% to the person who performed the service.

## Payment Distribution Rules

### 1. **Commissioned Staff** (`employmentType: 'commissioned'`)

For commissioned staff members, payments are split as follows:

#### Service Amount
- **Staff receives**: Commission percentage (e.g., 60% of service price)
- **Owner receives**: Remainder (e.g., 40% of service price)

#### Gratuity Amount
- **Staff receives**: 100% of all gratuity/tips
- **Owner receives**: 0% of gratuity

#### Example Calculation
```
Service Price: $450.00
Commission Rate: 60%
Gratuity: $90.00 (20% tip)

Split:
- Staff Commission from Service: $450 × 60% = $270.00
- Owner Portion from Service: $450 × 40% = $180.00
- Staff Gratuity (100%): $90.00

Staff Total: $270.00 + $90.00 = $360.00
Owner Total: $180.00
```

### 2. **Students** (`role: 'student'`)

Students are learning and supervised, so:
- **Service amount**: 100% to owner
- **Gratuity**: 100% to owner
- Students do not receive any portion of payments (they're compensated differently)

### 3. **Booth Renters** (`employmentType: 'booth_renter'`)

Booth renters operate independently:
- **Service amount**: 100% to renter
- **Gratuity**: 100% to renter
- They pay monthly rent separately

### 4. **Owners** (`role: 'owner'`)

Owners performing services:
- **Service amount**: 100% to owner
- **Gratuity**: 100% to owner

## Database Schema

### CommissionTransaction Model

```prisma
model CommissionTransaction {
  id                String   @id @default(cuid())
  ownerId           String   // Studio owner who owes the commission
  staffId           String   // Staff member who earned the commission
  appointmentId     String?  // Related appointment
  amount            Float    // Service amount (excluding gratuity)
  gratuityAmount    Float    @default(0) // Gratuity - 100% to staff
  commissionRate    Float    // Commission percentage
  commissionAmount  Float    // Staff commission from service
  ownerAmount       Float    // Owner's portion from service
  staffTotalAmount  Float?   // Total staff receives (commission + gratuity)
  employmentType    String   // Employment type at time of transaction
  status            String   @default("pending")
  paidAt            DateTime?
  paidMethod        String?
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Key Fields

- **`amount`**: Service price only (does NOT include gratuity)
- **`gratuityAmount`**: Tip amount (goes 100% to staff for commissioned employees)
- **`commissionAmount`**: Staff's commission from service (amount × commissionRate)
- **`ownerAmount`**: Owner's portion from service (amount - commissionAmount)
- **`staffTotalAmount`**: Total staff receives (commissionAmount + gratuityAmount)

## Implementation Files

### Core Logic

**File**: `lib/payment-routing.ts`

```typescript
// Function signature with gratuity parameter
export async function getPaymentRouting(
  serviceProviderId: string,
  serviceAmount: number,
  gratuityAmount: number = 0
): Promise<PaymentRoutingResult>

// Function to record commission with gratuity
export async function recordCommissionTransaction(
  ownerId: string,
  staffId: string,
  serviceAmount: number,
  commissionRate: number,
  employmentType: string,
  gratuityAmount: number = 0,
  appointmentId?: string,
  notes?: string
): Promise<void>
```

### Usage Example

```typescript
// When booking an appointment or processing a payment
const serviceAmount = 450.00
const gratuityAmount = 90.00

// Get payment routing
const routing = await getPaymentRouting(
  staffMemberId,
  serviceAmount,
  gratuityAmount
)

// Record commission transaction if applicable
if (routing.shouldTrackCommission) {
  await recordCommissionTransaction(
    routing.recipientId,    // Owner ID
    staffMemberId,          // Staff ID
    serviceAmount,          // $450 (service only)
    routing.commissionRate, // e.g., 60%
    routing.employmentType, // 'commissioned'
    gratuityAmount,         // $90 (goes 100% to staff)
    appointmentId,
    'Microblading service for Jane Doe'
  )
}
```

## Financial Tracking

### For Studio Owners

Owners can track:
- Total service revenue collected
- Commission owed to staff members
- Gratuity amounts (informational only - not owed from owner's funds)
- Net revenue after commissions

### For Staff Members

Staff can see:
- Commission earned from services
- Gratuity received
- Total earnings
- Payment status and history

## Migration Notes

### Database Migration Required

After updating the schema, run:

```bash
npx prisma migrate dev --name add_gratuity_to_commission_transactions
npx prisma generate
```

### Backward Compatibility

Existing commission transactions:
- Will have `gratuityAmount` default to 0
- Will function correctly with the new system
- No data loss or corruption

## Best Practices

### When Creating Appointments/Bookings

1. Always separate service amount from gratuity in your request
2. Pass both values to payment routing functions
3. Record commission transactions with both amounts

### When Displaying Financial Information

1. Show service commission and gratuity separately
2. Make it clear that gratuity goes 100% to staff
3. Display staff total as: Commission + Gratuity

### When Processing Payments

1. Collect total amount (service + tax + gratuity) from client
2. Route service portion according to employment type
3. Route gratuity 100% to staff (for commissioned employees)
4. Record transaction with separated amounts

## Compliance & Tax Implications

### For Tax Reporting

- Service income and commission should be reported separately
- Gratuity/tips may have different tax treatment
- Consult with a tax professional for your jurisdiction

### For Fair Labor Practices

- This system ensures tips go to service providers (common industry practice)
- Complies with fair tip distribution laws in most jurisdictions
- Provides transparent accounting for all parties

## Future Enhancements

### Planned Features

1. **Automatic Tip Distribution**: When multiple staff work on a service
2. **Tip Pooling**: Optional tip sharing among team members
3. **Tip Reporting**: Detailed tip reports for tax purposes
4. **Client Tip Preferences**: Remember client tipping patterns

### Integration Points

- Stripe Connect for automated payment splits
- QuickBooks/accounting software for tax reporting
- Payroll systems for commission tracking

## Support

For questions about the commission and gratuity system:
- Review this documentation
- Check `lib/payment-routing.ts` for implementation details
- Refer to `prisma/schema.prisma` for data model

## Related Documentation

- `HYBRID_PAYMENT_SYSTEM.md` - Overall payment system architecture
- `STRIPE_CONNECT_README.md` - Payment processing details
- `STAFF_MANAGEMENT_SYSTEM.md` - Staff roles and permissions

