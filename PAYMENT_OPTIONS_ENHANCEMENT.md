# Payment Options Enhancement

## Overview

This document outlines the enhanced payment system that provides clients with multiple payment options including:
1. **Collect in Person** - Mark deposits to be collected in person (no online payment)
2. **Pay Ahead** - Allow full payment upfront during booking
3. **BNPL Options** - Display Buy Now Pay Later options (Klarna, Affirm, Afterpay/Clearpay)
4. **Credit Card** - Traditional credit/debit card payments

## Database Changes

### Updated DepositPayment Model

```prisma
model DepositPayment {
  // ... existing fields ...
  paymentMethod         String?       // "card", "klarna", "affirm", "afterpay", "in_person", "cash"
  collectInPerson       Boolean       @default(false) // True if payment will be collected in person
  allowFullPayment      Boolean       @default(false) // True if client can pay full amount upfront
  // ... rest of fields ...
}
```

### Migration Required

```bash
npx prisma migrate dev --name add_payment_options
npx prisma generate
```

## Feature 1: Collect in Person

### Artist Flow

When sending a deposit link, artist can select:
- ✅ **Send Payment Link** (default) - Client pays online
- ✅ **Collect in Person** - Mark as "will collect in person"

###Implementation

**Location**: Where artists create deposit links (e.g., booking calendar, client management)

```tsx
// Add to deposit creation form
<div className="space-y-2">
  <Label>Payment Collection Method</Label>
  <div className="grid grid-cols-2 gap-4">
    <div 
      onClick={() => setCollectInPerson(false)}
      className={`border-2 rounded-lg p-4 cursor-pointer ${
        !collectInPerson ? 'border-lavender bg-lavender/5' : 'border-gray-200'
      }`}
    >
      <CreditCard className="h-6 w-6 mb-2 text-lavender" />
      <h4 className="font-semibold">Send Payment Link</h4>
      <p className="text-sm text-gray-600">Client pays online via Stripe</p>
    </div>
    
    <div 
      onClick={() => setCollectInPerson(true)}
      className={`border-2 rounded-lg p-4 cursor-pointer ${
        collectInPerson ? 'border-lavender bg-lavender/5' : 'border-gray-200'
      }`}
    >
      <Wallet className="h-6 w-6 mb-2 text-lavender" />
      <h4 className="font-semibold">Collect in Person</h4>
      <p className="text-sm text-gray-600">Accept cash/card at appointment</p>
    </div>
  </div>
</div>
```

### Client Experience

When `collectInPerson` is true:
- Deposit link shows: "Payment will be collected in person at your appointment"
- No Stripe checkout button
- Status automatically set to "CONFIRMED_IN_PERSON"
- Artist can manually mark as paid when received

### API Updates

**POST `/api/deposit-payments`**

Add to request body:
```json
{
  "collectInPerson": boolean,
  "allowFullPayment": boolean
}
```

## Feature 2: Pay Ahead During Booking

### Booking Flow Enhancement

When client books an appointment on public booking page:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Payment Options</CardTitle>
    <CardDescription>Choose how you'd like to pay</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Option 1: Pay Deposit Now */}
      <div 
        onClick={() => setPaymentChoice('deposit')}
        className={`border-2 rounded-lg p-4 cursor-pointer ${
          paymentChoice === 'deposit' ? 'border-lavender bg-lavender/5' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Pay Deposit Now</h4>
            <p className="text-sm text-gray-600">
              ${depositAmount} today, ${remainingAmount} at appointment
            </p>
          </div>
          <Badge>Recommended</Badge>
        </div>
      </div>

      {/* Option 2: Pay Full Amount */}
      <div 
        onClick={() => setPaymentChoice('full')}
        className={`border-2 rounded-lg p-4 cursor-pointer ${
          paymentChoice === 'full' ? 'border-lavender bg-lavender/5' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Pay Full Amount</h4>
            <p className="text-sm text-gray-600">
              Pay ${totalAmount} now, nothing at appointment
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      </div>

      {/* Option 3: Pay at Appointment */}
      <div 
        onClick={() => setPaymentChoice('later')}
        className={`border-2 rounded-lg p-4 cursor-pointer ${
          paymentChoice === 'later' ? 'border-lavender bg-lavender/5' : 'border-gray-200'
        }`}
      >
        <h4 className="font-semibold">Pay at Appointment</h4>
        <p className="text-sm text-gray-600">
          Reserve now, pay ${totalAmount} in person
        </p>
      </div>
    </div>

    {/* Show payment method options if paying online */}
    {(paymentChoice === 'deposit' || paymentChoice === 'full') && (
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold mb-3">Payment Methods</h4>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            <CreditCard className="h-4 w-4 mr-2" />
            Credit/Debit Card
          </Button>
          <Button variant="outline" className="justify-start">
            <img src="/klarna-logo.svg" className="h-4 mr-2" />
            Klarna
          </Button>
          <Button variant="outline" className="justify-start">
            <img src="/affirm-logo.svg" className="h-4 mr-2" />
            Affirm
          </Button>
          <Button variant="outline" className="justify-start">
            <img src="/afterpay-logo.svg" className="h-4 mr-2" />
            Afterpay
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          All payment methods processed securely through Stripe
        </p>
      </div>
    )}

    <Button 
      className="w-full mt-6 bg-lavender hover:bg-lavender-600"
      onClick={handleBooking}
      disabled={!paymentChoice}
    >
      {paymentChoice === 'deposit' && `Pay $${depositAmount} & Confirm Booking`}
      {paymentChoice === 'full' && `Pay $${totalAmount} & Confirm Booking`}
      {paymentChoice === 'later' && 'Confirm Booking'}
    </Button>
  </CardContent>
</Card>
```

## Feature 3: BNPL Payment Method Display

### Stripe Checkout Configuration

Update Stripe checkout session creation to include BNPL methods:

```typescript
// In /api/stripe/create-deposit-checkout/route.ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: [
    'card',           // Credit/debit cards
    'klarna',         // Klarna Pay in 4
    'affirm',         // Affirm monthly payments
    'afterpay_clearpay' // Afterpay/Clearpay
  ],
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${serviceName} - Deposit`,
          description: `Deposit for ${serviceName} service`
        },
        unit_amount: Math.round(amount * 100) // Amount in cents
      },
      quantity: 1
    }
  ],
  success_url: successUrl,
  cancel_url: cancelUrl,
  customer_email: clientEmail,
  metadata: {
    depositId,
    clientId,
    userId
  }
})
```

### Payment Method Icons

Add logos for each payment method:
- Download official brand assets from Stripe
- Place in `/public/payment-methods/`
- Display in UI with proper branding guidelines

## Implementation Checklist

### Phase 1: Database & API
- [x] Update DepositPayment schema with new fields
- [ ] Run database migration
- [ ] Update deposit creation API to accept new fields
- [ ] Update deposit retrieval API to return new fields

### Phase 2: Collect in Person
- [ ] Add payment collection method selector to deposit creation
- [ ] Update deposit link page to show "in person" status
- [ ] Add manual "mark as paid" button for artists
- [ ] Update status when marked as paid in person

### Phase 3: Booking Flow
- [ ] Add payment option selector to booking page
- [ ] Implement full payment option
- [ ] Implement pay-later option
- [ ] Show payment method icons/options

### Phase 4: BNPL Integration
- [ ] Update Stripe session creation with BNPL methods
- [ ] Add payment method logos to UI
- [ ] Test each BNPL provider
- [ ] Add clear messaging about payment terms

### Phase 5: UI Polish
- [ ] Add tooltips explaining each option
- [ ] Show estimated payment schedules for BNPL
- [ ] Add confirmation dialogs
- [ ] Improve mobile responsiveness

## User Experience Flow

### Artist Creating Deposit

```
1. Click "Request Deposit" on appointment
2. Enter deposit amount
3. Choose collection method:
   - Send Payment Link (client pays online)
   - Collect in Person (client pays at appointment)
4. If online: Client receives email with link
5. If in person: Booking confirmed, artist marks paid when received
```

### Client Booking Appointment

```
1. Select service on public booking page
2. Choose date/time
3. Enter contact information
4. Choose payment option:
   - Pay deposit now ($X)
   - Pay full amount now ($Y)
   - Pay at appointment
5. If paying online:
   - See available payment methods
   - Choose preferred method (card, Klarna, Affirm, Afterpay)
   - Complete Stripe checkout
6. Receive confirmation email
```

## Testing Scenarios

### Collect in Person
1. Create deposit with "collect in person" selected
2. Verify client sees appropriate message
3. Verify no Stripe session created
4. Artist marks as paid manually
5. Status updates correctly

### Pay Ahead
1. Book appointment with "pay full amount" option
2. Complete payment
3. Verify full amount recorded
4. Verify remaining balance is $0
5. Confirmation shows "Paid in Full"

### BNPL Methods
1. Select Klarna at checkout
2. Verify Klarna payment flow works
3. Repeat for Affirm and Afterpay
4. Verify proper payment recording
5. Test refund scenarios for each method

## Stripe Configuration

### Required Stripe Settings

1. **Enable Payment Methods**:
   - Go to Stripe Dashboard → Settings → Payment Methods
   - Enable: Cards, Klarna, Affirm, Afterpay/Clearpay

2. **BNPL Requirements**:
   - Klarna: Available for amounts $35-$10,000
   - Affirm: Available for amounts $50-$30,000
   - Afterpay: Available for amounts $50-$2,000

3. **Verification**:
   - Business must be verified
   - Proper business category selected
   - Terms of service agreed

## Benefits

### For Clients
✅ Flexibility in payment timing
✅ Multiple payment method options
✅ BNPL for expensive services
✅ Clear upfront pricing
✅ Option to pay in person if preferred

### For Artists
✅ More booking conversions
✅ Reduced no-shows (when deposit paid)
✅ Flexibility for client relationships
✅ Professional payment experience
✅ All payments tracked in one system

## Support & Resources

- Stripe BNPL Documentation: https://stripe.com/docs/payments/payment-methods
- Klarna Integration: https://stripe.com/docs/payments/klarna
- Affirm Integration: https://stripe.com/docs/payments/affirm
- Afterpay Integration: https://stripe.com/docs/payments/afterpay-clearpay

## Future Enhancements

- Payment plans for very expensive services
- Subscription-based packages
- Gift certificates
- Loyalty program integration
- Automatic payment reminders
- Split payments (multiple cards)

