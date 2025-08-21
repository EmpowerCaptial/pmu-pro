# Payment-Gated Authentication System

## 🎯 **Overview**

PMU Pro now implements a comprehensive payment-gated authentication system that ensures only artists with verified licenses and active payments can access the platform.

## 🔐 **How It Works**

### **1. User Registration Flow**
1. Artist signs up with license and insurance documents
2. Documents are reviewed by admin team (24-48 hours)
3. Once verified, artist must complete payment to access the site
4. Access is granted only after both verification AND payment

### **2. Login Flow**
1. Artist enters email on login page
2. System checks:
   - Does user exist?
   - Is license verified?
   - Has payment been completed?
3. Based on status, user is redirected appropriately

### **3. Access Control**
- **No Account**: Redirected to signup
- **License Pending**: Redirected to verification pending page
- **Payment Required**: Redirected to billing page
- **Fully Verified + Paid**: Access granted to dashboard

## 🚀 **Features Implemented**

### **Payment Verification Service**
- Real-time Stripe subscription status checking
- Automatic access control based on payment status
- Support for different subscription states (active, past_due, canceled, etc.)

### **Enhanced Stripe Webhooks**
- Automatic user subscription updates
- Real-time payment status synchronization
- Handles subscription changes, cancellations, and payment failures

### **Payment-Gated Components**
- `PaymentVerification` component for wrapping protected content
- `usePaymentVerification` hook for checking access in components
- Automatic redirects to billing when payment is needed

### **New API Endpoints**
- `/api/payment/verify` - Check user payment status
- `/api/stripe/customer-portal` - Manage subscriptions
- Enhanced `/api/auth/signin` with payment verification

## 📱 **Usage Examples**

### **Protecting a Page with Payment Verification**

```tsx
import { PaymentVerification } from '@/components/payment-verification'

export default function ProtectedPage() {
  return (
    <PaymentVerification userId="user123">
      <div>This content is only visible to paid users</div>
    </PaymentVerification>
  )
}
```

### **Using the Payment Verification Hook**

```tsx
import { usePaymentVerification } from '@/components/payment-verification'

export default function MyComponent() {
  const { hasAccess, subscriptionStatus, isLoading } = usePaymentVerification(userId)
  
  if (isLoading) return <div>Loading...</div>
  if (!hasAccess) return <div>Payment required</div>
  
  return <div>Protected content here</div>
}
```

### **Checking Payment Status in API Routes**

```tsx
import { PaymentVerificationService } from '@/lib/payment-verification'

export async function POST(request: NextRequest) {
  const verification = await PaymentVerificationService.verifyUserAccess(userId)
  
  if (!verification.hasAccess) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 })
  }
  
  // Proceed with protected operation
}
```

## 🔄 **Payment Status Flow**

### **Subscription States**
- **`active`** - User has access
- **`trialing`** - User has access (trial period)
- **`past_due`** - Payment overdue, access blocked
- **`unpaid`** - Payment failed, access blocked
- **`canceled`** - Subscription ended, access blocked
- **`inactive`** - No subscription, access blocked

### **Automatic Actions**
- **Payment Success**: User access restored immediately
- **Payment Failure**: User access blocked, redirected to billing
- **Subscription Canceled**: User access blocked, redirected to billing
- **Past Due**: User access blocked, redirected to billing

## 🛡️ **Security Features**

### **Access Control**
- License verification required before payment
- Payment verification on every protected route
- Real-time Stripe status checking
- No bypass of payment requirements

### **Data Protection**
- User subscription data encrypted in database
- Secure webhook signature verification
- No sensitive data exposed in client-side code

## 📋 **Configuration Required**

### **Environment Variables**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

### **Stripe Webhook Setup**
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🧪 **Testing**

### **Test Scenarios**
1. **New User**: Signup → Verification → Payment → Access
2. **Payment Failure**: Login → Redirected to billing
3. **Subscription Canceled**: Login → Redirected to billing
4. **Past Due Payment**: Login → Redirected to billing
5. **Admin Access**: Bypass payment verification

### **Test Cards**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Prisma Build Errors**: Ensure `prisma generate` runs during build
2. **Webhook Failures**: Check Stripe webhook endpoint and secret
3. **Payment Verification Fails**: Verify Stripe API keys and webhook setup
4. **User Access Denied**: Check subscription status in Stripe dashboard

### **Debug Steps**
1. Check Stripe webhook logs
2. Verify environment variables are set
3. Check database for user subscription status
4. Test payment verification API endpoint

## 📚 **Next Steps**

### **Future Enhancements**
- Email notifications for payment failures
- Grace period for late payments
- Subscription upgrade/downgrade flows
- Payment method management
- Invoice history and receipts

### **Integration Points**
- Connect with existing user management
- Add payment analytics dashboard
- Implement subscription renewal reminders
- Add payment method validation

## 🎉 **Summary**

The payment-gated authentication system ensures:
- ✅ Only verified professionals can access PMU Pro
- ✅ Payment is required before access is granted
- ✅ Real-time payment status monitoring
- ✅ Automatic access control and redirects
- ✅ Secure subscription management
- ✅ Professional-grade security and reliability

Your PMU Pro application now has enterprise-level access control and payment management! 🚀
