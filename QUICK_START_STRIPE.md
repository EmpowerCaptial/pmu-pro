# 🚀 Quick Start: Stripe Connect Setup for PMU Pro

## ⚡ **Get Started in 5 Minutes**

### **1. Run the Setup Script**
```bash
./setup-stripe-env.sh
```
This will prompt you for your Stripe keys and create the `.env.local` file.

### **2. Get Your Stripe Keys**
1. **Login to Stripe**: [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Go to Developers → API keys**
3. **Copy your keys**:
   - **Secret key**: `sk_live_...` or `sk_test_...`
   - **Publishable key**: `pk_live_...` or `pk_test_...`

### **3. Enable Stripe Connect**
1. **Navigate to**: Connect → Settings
2. **Toggle ON**: Enable Connect
3. **Select**: Express accounts

### **4. Test the Integration**
1. **Restart your app** (to load new environment variables)
2. **Go to**: `/stripe-connect`
3. **Try creating**: A test account

---

## 🔑 **Required Environment Variables**

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...          # Your secret key
STRIPE_PUBLISHABLE_KEY=pk_live_...     # Your publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Frontend key

# App Configuration
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🧪 **Test Mode vs Live Mode**

### **Test Mode (Recommended for first setup)**
- Use `sk_test_...` and `pk_test_...` keys
- No real money involved
- Perfect for testing the flow
- Can test with Stripe's test cards

### **Live Mode (Production)**
- Use `sk_live_...` and `pk_live_...` keys
- Real money and real payouts
- Requires verified business information
- Full compliance requirements

---

## 🎯 **What Happens Next**

1. **Artist visits** `/stripe-connect`
2. **Clicks** "Set Up Your Payment Account"
3. **Fills out** business information
4. **Creates** Stripe Connect account
5. **Completes** Stripe onboarding
6. **Starts receiving** payments from clients

---

## 🆘 **Need Help?**

- **Setup Guide**: `STRIPE_PRODUCTION_SETUP.md`
- **API Documentation**: `STRIPE_CONNECT_README.md`
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)

---

## ✅ **Quick Test Checklist**

- [ ] Environment variables set
- [ ] Stripe Connect enabled
- [ ] App restarted
- [ ] `/stripe-connect` page loads
- [ ] Account creation works
- [ ] Stripe onboarding redirects

---

**Ready to start? Run `./setup-stripe-env.sh` and follow the prompts!** 🚀
