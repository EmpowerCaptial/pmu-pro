# 🏦 Stripe Connect Integration for PMU Pro

## Overview

PMU Pro now includes a complete **Stripe Connect (Express)** integration that enables artists to receive direct payouts from client payments. This system handles the entire payment flow from client checkout to artist bank account deposits.

## 🚀 Key Features

### ✅ **For Artists**
- **Direct Bank Deposits**: Money flows directly to your bank account
- **Professional Payment Processing**: Legitimate business payment infrastructure
- **Automatic Tax Reporting**: Built-in 1099-K generation
- **Competitive Fees**: Low payment processing rates
- **Secure & Compliant**: PCI DSS compliant with fraud protection

### ✅ **For PMU Pro Platform**
- **Revenue Generation**: Platform fees from each transaction
- **Artist Retention**: Professional payment infrastructure
- **Scalability**: Easy onboarding of new artists
- **Compliance**: Built-in regulatory compliance

## 🏗️ System Architecture

```
Client Payment Flow:
1. Client selects service → PMU Pro checkout
2. Payment processed → Stripe Checkout
3. Funds held → PMU Pro platform
4. Service completed → Artist payout triggered
5. Money transferred → Artist bank account

Revenue Split Example:
- Service Price: $450
- PMU Pro Fee: $45 (10%)
- Stripe Fee: $13.35 (2.9% + $0.30)
- Artist Receives: $391.65 (87.0%)
```

## 📁 File Structure

```
lib/
├── stripe-connect.ts          # Core types, interfaces, and utilities
├── services.ts               # PMU service definitions
└── checkout.ts              # Checkout system logic

app/
├── api/stripe/connect/
│   ├── create-account/      # Artist onboarding API
│   └── create-payout/       # Payout processing API
├── stripe-connect/          # Main Stripe Connect page
└── checkout/                # Service checkout system

components/
├── stripe-connect/
│   ├── onboarding.tsx       # Artist account setup
│   └── payout-dashboard.tsx # Payment history & analytics
└── checkout/
    └── service-checkout.tsx # Service selection & checkout
```

## 🔧 Setup Instructions

### 1. **Environment Variables**
```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. **Stripe Dashboard Setup**
1. **Enable Connect**: Go to Stripe Dashboard → Connect → Settings
2. **Configure Express**: Set up Express onboarding flow
3. **Webhook Endpoints**: Configure for payment events
4. **Platform Fees**: Set up application fee structure

### 3. **Platform Configuration**
```typescript
// lib/stripe-connect.ts
export const PLATFORM_FEES: PlatformFeeStructure = {
  type: 'percentage',
  value: 0.10,        // 10%
  minimumFee: 5,      // $5 minimum
  maximumFee: 50,     // $50 maximum
  description: '10% platform fee (min $5, max $50)'
}
```

## 🎯 User Experience Flow

### **Artist Onboarding**
1. **Navigate to Stripe Connect** (`/stripe-connect`)
2. **Complete Business Information**:
   - Business type (Individual/Company)
   - Country selection
   - Currency preference
3. **Stripe Verification**:
   - Identity verification (KYC)
   - Bank account setup
   - Business documentation
4. **Account Activation**:
   - Wait for Stripe review
   - Complete any additional requirements
   - Start receiving payments

### **Client Checkout Process**
1. **Service Selection**: Artist chooses service and client
2. **Payment Processing**: Client completes Stripe checkout
3. **Funds Held**: Money held by PMU Pro platform
4. **Service Completion**: Artist marks service as complete
5. **Automatic Payout**: Funds transferred to artist account

### **Payout Management**
1. **View Transactions**: Complete payment history
2. **Track Payouts**: Monitor pending and completed transfers
3. **Export Data**: Download CSV for accounting
4. **Analytics**: Revenue and fee breakdowns

## 💰 Fee Structure

### **Platform Fees**
- **Percentage**: 10% of service amount
- **Minimum**: $5 per transaction
- **Maximum**: $50 per transaction
- **Example**: $450 service = $45 platform fee

### **Stripe Processing Fees**
- **Standard Rate**: 2.9% + $0.30 per transaction
- **International**: Additional 1% for international cards
- **Currency Conversion**: 1% for non-USD transactions

### **Artist Net Receipt**
```
Service: $450
Platform Fee: -$45 (10%)
Stripe Fee: -$13.35 (2.9% + $0.30)
Artist Net: $391.65 (87.0%)
```

## 🔌 API Endpoints

### **Create Stripe Connect Account**
```http
POST /api/stripe/connect/create-account
Content-Type: application/json

{
  "artistId": "artist_001",
  "artistName": "Sarah Johnson",
  "artistEmail": "sarah@pmupro.com",
  "businessType": "individual",
  "country": "US",
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "accountId": "acct_1234567890",
  "accountLink": "https://connect.stripe.com/...",
  "account": {
    "status": "pending",
    "chargesEnabled": false,
    "payoutsEnabled": false,
    "detailsSubmitted": false
  }
}
```

### **Create Payout**
```http
POST /api/stripe/connect/create-payout
Content-Type: application/json

{
  "artistId": "artist_001",
  "stripeAccountId": "acct_1234567890",
  "amount": 391.65,
  "currency": "usd",
  "description": "Microblading service for Sarah Johnson",
  "metadata": {
    "serviceId": "microblading",
    "clientId": "client_001"
  }
}
```

## 📊 Data Models

### **StripeConnectAccount**
```typescript
interface StripeConnectAccount {
  id: string
  artistId: string
  stripeAccountId: string
  status: 'pending' | 'active' | 'restricted' | 'disabled'
  businessType: 'individual' | 'company'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements: AccountRequirements
  payoutSchedule: 'manual' | 'automatic'
  payoutDelay: number
  createdAt: string
  updatedAt: string
}
```

### **PayoutTransaction**
```typescript
interface PayoutTransaction {
  id: string
  artistId: string
  stripeAccountId: string
  checkoutSessionId: string
  serviceId: string
  serviceName: string
  clientName: string
  grossAmount: number
  platformFee: number
  stripeFee: number
  netAmount: number
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
  payoutId?: string
  payoutDate?: string
  bankAccount: string
  createdAt: string
  updatedAt: string
}
```

## 🎨 UI Components

### **StripeConnectOnboarding**
- Business type selection
- Country and currency setup
- Stripe account creation
- Verification status tracking

### **PayoutDashboard**
- Transaction summary cards
- Payment history table
- Period filtering (7d, 30d, 90d, all)
- CSV export functionality
- Payout status tracking

### **Main Stripe Connect Page**
- Overview tab with account status
- Payouts tab with transaction history
- Settings tab with account preferences
- Quick action buttons

## 🔒 Security & Compliance

### **PCI Compliance**
- Stripe handles all sensitive payment data
- No credit card information stored locally
- Secure token-based payment processing

### **KYC Verification**
- Built-in identity verification
- Business documentation requirements
- Regulatory compliance checks

### **Fraud Protection**
- Stripe's advanced fraud detection
- Risk assessment algorithms
- Dispute resolution handling

## 🧪 Testing & Development

### **Mock Data**
```typescript
// lib/stripe-connect.ts
const mockStripeConnectAccounts: StripeConnectAccount[] = [
  {
    id: 'connect_001',
    artistId: 'artist_001',
    stripeAccountId: 'acct_mock123',
    status: 'active',
    // ... other properties
  }
]
```

### **Demo Mode**
- Use `/stripe-connect` for full functionality
- Mock Stripe API responses
- Local storage for data persistence
- No real money involved

### **Testing Scenarios**
1. **Account Creation**: Test onboarding flow
2. **Payment Processing**: Simulate client checkout
3. **Payout Generation**: Test payout calculations
4. **Error Handling**: Test various failure scenarios

## 🚀 Production Deployment

### **Stripe Connect Setup**
1. **Switch to Live Mode**: Update environment variables
2. **Webhook Configuration**: Set up production endpoints
3. **Compliance Review**: Ensure regulatory requirements
4. **Monitoring**: Set up alerts and logging

### **Performance Optimization**
- Database indexing for transactions
- Caching for account status
- Background job processing
- Rate limiting for API calls

### **Monitoring & Analytics**
- Payment success rates
- Payout processing times
- Platform fee revenue
- Artist satisfaction metrics

## 🔮 Future Enhancements

### **Advanced Features**
- **Multi-Currency Support**: International artist onboarding
- **Advanced Payouts**: Custom payout schedules
- **Tax Reporting**: Enhanced 1099-K generation
- **Analytics Dashboard**: Revenue insights and trends

### **Integration Opportunities**
- **Accounting Software**: QuickBooks, Xero integration
- **Banking APIs**: Direct bank account verification
- **Compliance Tools**: Automated regulatory reporting
- **Marketing Tools**: Payment-based analytics

### **Mobile Experience**
- **Mobile App**: Native iOS/Android apps
- **Push Notifications**: Payment and payout alerts
- **Offline Support**: Limited offline functionality
- **Biometric Auth**: Secure mobile access

## 📚 Additional Resources

### **Stripe Documentation**
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Express Onboarding](https://stripe.com/docs/connect/express-accounts)
- [Webhook Events](https://stripe.com/docs/api/webhook_endpoints)
- [API Reference](https://stripe.com/docs/api)

### **PMU Pro Integration**
- [Checkout System](CHECKOUT_SYSTEM_README.md)
- [Client Management](CLIENT_MANAGEMENT_README.md)
- [Service Management](SERVICE_MANAGEMENT_README.md)
- [API Documentation](API_README.md)

### **Support & Troubleshooting**
- [Common Issues](TROUBLESHOOTING.md)
- [FAQ](FAQ.md)
- [Contact Support](mailto:support@pmupro.com)

## 🎯 Getting Started

1. **Set up Stripe account** and enable Connect
2. **Configure environment variables** with your Stripe keys
3. **Test the onboarding flow** with mock data
4. **Process a test payment** to verify the flow
5. **Review payout calculations** and fee structure
6. **Deploy to production** when ready

---

*Built with ❤️ for PMU artists by PMU Pro Team*

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Stripe Connect Version**: Express  
**Compliance**: PCI DSS, KYC, 1099-K
