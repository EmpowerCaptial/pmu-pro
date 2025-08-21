# Magic Link Authentication Testing Guide

## 🎯 What We've Built

Your PMU Pro application now has a complete **magic link authentication system** that:

✅ **Generates secure tokens** with 24-hour expiration  
✅ **Sends beautiful HTML emails** with magic links  
✅ **Verifies tokens** and authenticates users  
✅ **Integrates with payment verification** (blocks access if no active subscription)  
✅ **Works in development mode** (logs emails to console)  
✅ **Ready for production** (easy email service integration)  

## 🧪 Testing the Magic Link System

### 1. **Test User Created**
- **Email**: `test@example.com`
- **Status**: License verified ✅, Active subscription ✅
- **Role**: Artist

### 2. **Test the Login Flow**

1. **Go to Login Page**: Navigate to `/auth/login`
2. **Enter Test Email**: Use `test@example.com`
3. **Click "Send Magic Link"**
4. **Check Console**: The magic link will be logged to your terminal/console
5. **Click the Magic Link**: Copy the URL from console and open it
6. **Verify Authentication**: You should see "Sign In Successful!" and be redirected to dashboard

### 3. **What Happens Behind the Scenes**

```
User enters email → API checks license & payment → Generates secure token → 
Sends email with magic link → User clicks link → Verifies token → 
Checks payment status → Creates session → Redirects to dashboard
```

## 🔧 Development Mode Features

### **Console Logging**
In development, emails are logged to console instead of being sent:
```
📧 EMAIL SENT (Development Mode)
To: test@example.com
From: noreply@pmu-guide.com
Subject: Sign in to PMU Pro
🔗 MAGIC LINK FOR TESTING:
http://localhost:3000/auth/verify?token=abc123...
```

### **Database Storage**
- Magic link tokens are stored in `magic_link_tokens` table
- Tokens expire after 24 hours
- Tokens are marked as "used" after verification
- Expired tokens are automatically cleaned up

## 🚀 Production Email Integration

### **Choose Your Email Service**

1. **SendGrid** (Recommended for beginners)
   ```bash
   npm install @sendgrid/mail
   ```
   Set environment variable: `SENDGRID_API_KEY`

2. **AWS SES** (Cost-effective for high volume)
   ```bash
   npm install aws-sdk
   ```
   Set environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

3. **Resend** (Modern, developer-friendly)
   ```bash
   npm install resend
   ```
   Set environment variable: `RESEND_API_KEY`

4. **Mailgun** (Reliable, good deliverability)
   ```bash
   npm install mailgun.js form-data
   ```
   Set environment variables: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`

### **Enable Production Mode**
1. Set `NODE_ENV=production` in your environment
2. Add your email service API key
3. Update `lib/email-service.ts` with your chosen service

## 🧪 Testing Scenarios

### **Scenario 1: Valid User with Active Subscription**
- ✅ Should receive magic link email
- ✅ Should be able to authenticate
- ✅ Should be redirected to dashboard

### **Scenario 2: User Without License Verification**
- ❌ Should see "License verification pending"
- ❌ Should be redirected to verification page

### **Scenario 3: User Without Active Payment**
- ❌ Should see "Payment required"
- ❌ Should be redirected to billing page

### **Scenario 4: Expired/Invalid Token**
- ❌ Should see "Invalid or expired token"
- ❌ Should be able to request new magic link

## 🔒 Security Features

- **Token Expiration**: 24 hours
- **Single Use**: Tokens are marked as used after verification
- **Secure Generation**: Uses crypto.randomBytes for token generation
- **Payment Verification**: Blocks access if subscription is inactive
- **License Verification**: Ensures only verified professionals can access

## 🐛 Troubleshooting

### **Common Issues**

1. **"User not found"**
   - Check if test user exists in database
   - Verify email spelling

2. **"License verification pending"**
   - Test user needs `isLicenseVerified: true`

3. **"Payment required"**
   - Test user needs `hasActiveSubscription: true`

4. **Build errors**
   - Run `npx prisma generate` before building
   - Ensure database schema is up to date

### **Database Issues**
```bash
# Reset database
rm prisma/dev.db
npx prisma db push

# Create test user again
npx tsx scripts/create-test-user.ts
```

## 📱 Next Steps

1. **Test the magic link flow** with the test user
2. **Choose an email service** for production
3. **Set up environment variables** for your chosen service
4. **Test in production** environment
5. **Customize email templates** if needed

## 🎉 Success!

Your magic link authentication system is now fully functional and ready for production use! Users can securely sign in without passwords, and the system automatically handles payment verification and access control.

---

**Need help?** Check the console logs for detailed information about what's happening during the authentication process.
