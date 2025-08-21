# 🏦 Stripe Connect Production Setup Guide for PMU Pro

## 🎯 **Overview**
This guide walks you through setting up Stripe Connect in production to enable artist payouts.

---

## 📋 **Prerequisites**
- ✅ Stripe account (test or live)
- ✅ PMU Pro application deployed
- ✅ Domain configured
- ✅ Environment variables ready

---

## 🔑 **Step 1: Environment Variables Setup**

### **Create/Update `.env.local` file:**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...          # Your LIVE Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_live_...     # Your LIVE Stripe publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Frontend key

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://yourdomain.com     # Your production domain
NEXTAUTH_SECRET=your-secret-here               # Authentication secret
NEXTAUTH_URL=https://yourdomain.com            # Production URL

# Database (if using production database)
DATABASE_URL=your-production-database-url
```

### **⚠️ Important Security Notes:**
- **NEVER commit** `.env.local` to git
- Use **LIVE keys** for production, **TEST keys** for development
- Keep your secret keys secure and private

---

## 🎛️ **Step 2: Stripe Dashboard Configuration**

### **2.1 Enable Stripe Connect**
1. **Login to Stripe Dashboard**: [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Navigate to**: Connect → Settings
3. **Enable Connect**: Toggle "Connect" to ON
4. **Select Type**: Choose "Express" (recommended for PMU Pro)

### **2.2 Configure Express Onboarding**
1. **Go to**: Connect → Settings → Express
2. **Customize Branding**:
   - **Business Name**: "PMU Pro"
   - **Logo**: Upload PMU Pro logo
   - **Primary Color**: Use your brand color
   - **Terms of Service**: Link to your terms

3. **Configure Requirements**:
   - **Identity Verification**: Required
   - **Bank Account**: Required
   - **Business Information**: Required
   - **Tax Information**: Required

### **2.3 Set Up Platform Fees**
1. **Navigate to**: Connect → Settings → Fees
2. **Configure Application Fees**:
   - **Fee Type**: Percentage
   - **Fee Amount**: 10%
   - **Fee Calculation**: Applied to each transaction
   - **Fee Collection**: Automatic

3. **Fee Limits**:
   - **Minimum Fee**: $5.00
   - **Maximum Fee**: $50.00

---

## 🌐 **Step 3: Webhook Configuration**

### **3.1 Create Webhook Endpoints**
1. **Go to**: Developers → Webhooks
2. **Add Endpoint**: Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhooks`
4. **Events to Send**:
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `payout.paid`
   - `payout.failed`

### **3.2 Webhook Security**
1. **Get Webhook Secret**: Copy the signing secret
2. **Add to Environment**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 🔧 **Step 4: API Configuration**

### **4.1 Test API Connection**
```bash
# Test with curl
curl -X POST https://yourdomain.com/api/stripe/connect/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "artistId": "test_001",
    "artistName": "Test Artist",
    "artistEmail": "test@example.com",
    "businessType": "individual",
    "country": "US"
  }'
```

### **4.2 Verify Response**
Expected response:
```json
{
  "success": true,
  "accountId": "acct_...",
  "accountLink": "https://connect.stripe.com/...",
  "account": {
    "status": "pending",
    "chargesEnabled": false,
    "payoutsEnabled": false
  }
}
```

---

## 🧪 **Step 5: Testing the Integration**

### **5.1 Test Account Creation**
1. **Navigate to**: `/stripe-connect`
2. **Click**: "Set Up Your Payment Account"
3. **Fill Form**: Use test data
4. **Create Account**: Should redirect to Stripe
5. **Verify**: Account appears in Stripe Dashboard

### **5.2 Test Payment Flow**
1. **Go to**: `/checkout`
2. **Select Service**: Choose any PMU service
3. **Select Client**: Use test client data
4. **Process Payment**: Use Stripe test card
5. **Verify**: Payment appears in Stripe

### **5.3 Test Payout System**
1. **Check Dashboard**: View payout transactions
2. **Verify Fees**: Platform fees calculated correctly
3. **Export Data**: Test CSV download functionality

---

## 🚀 **Step 6: Production Deployment**

### **6.1 Switch to Live Mode**
1. **Update Environment**: Change to live Stripe keys
2. **Test Live Account**: Create real Stripe Connect account
3. **Verify Webhooks**: Ensure live webhooks working
4. **Monitor Logs**: Check for any errors

### **6.2 First Live Transaction**
1. **Artist Onboarding**: Help first artist set up account
2. **Test Payment**: Process real client payment
3. **Verify Payout**: Ensure money flows correctly
4. **Document Process**: Record any issues or improvements

---

## 📊 **Step 7: Monitoring & Analytics**

### **7.1 Stripe Dashboard Monitoring**
- **Connect Accounts**: Monitor artist onboarding
- **Transactions**: Track payment success rates
- **Fees**: Verify platform fee collection
- **Payouts**: Monitor transfer success rates

### **7.2 PMU Pro Analytics**
- **Artist Onboarding**: Track completion rates
- **Payment Processing**: Monitor success/failure rates
- **Revenue Tracking**: Platform fee collection
- **User Experience**: Onboarding completion times

---

## 🔒 **Step 8: Security & Compliance**

### **8.1 PCI Compliance**
- ✅ **Stripe handles**: All sensitive payment data
- ✅ **No storage**: Credit card information locally
- ✅ **Secure processing**: Token-based payments

### **8.2 KYC Verification**
- ✅ **Identity verification**: Built into Stripe Connect
- ✅ **Business verification**: Required for all accounts
- ✅ **Tax compliance**: Automatic 1099-K generation

### **8.3 Fraud Protection**
- ✅ **Stripe Radar**: Advanced fraud detection
- ✅ **Risk assessment**: Automatic transaction screening
- ✅ **Dispute handling**: Built-in resolution system

---

## 🆘 **Troubleshooting Common Issues**

### **Issue 1: "Invalid API Key"**
**Solution**: Verify environment variables are correct and loaded

### **Issue 2: "Webhook Failed"**
**Solution**: Check webhook endpoint URL and secret

### **Issue 3: "Account Creation Failed"**
**Solution**: Verify Stripe Connect is enabled in dashboard

### **Issue 4: "Fees Not Applied"**
**Solution**: Check application fee configuration in Connect settings

---

## 📞 **Support Resources**

### **Stripe Support**
- **Documentation**: [stripe.com/docs/connect](https://stripe.com/docs/connect)
- **Support**: [support.stripe.com](https://support.stripe.com)
- **Community**: [community.stripe.com](https://community.stripe.com)

### **PMU Pro Support**
- **Technical Issues**: Check application logs
- **Configuration**: Review this guide
- **Emergency**: Contact development team

---

## ✅ **Final Checklist**

Before going live:
- [ ] Environment variables configured
- [ ] Stripe Connect enabled
- [ ] Webhooks configured
- [ ] Test accounts created
- [ ] Test payments processed
- [ ] Platform fees verified
- [ ] Payout system tested
- [ ] Monitoring configured
- [ ] Support team trained
- [ ] Documentation updated

---

## 🎯 **Next Steps After Setup**

1. **Train Representatives**: Use the onboarding guide
2. **Onboard First Artists**: Start with trusted artists
3. **Monitor Performance**: Track success rates
4. **Gather Feedback**: Improve user experience
5. **Scale Gradually**: Add more artists over time

---

*This guide should be updated as the system evolves and new features are added.*

**Last Updated**: January 2025  
**Version**: 1.0.0  
**For**: PMU Pro Production Deployment
