# Domain Setup Guide for thepmuguide.com

## 🎯 **Goal**
Set up `thepmuguide.com` as your primary domain with Google Workspace email (`admin@thepmuguide.com`)

## 🌐 **Step 1: DNS Configuration at Your Domain Registrar**

### **A Records (for website)**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.36
TTL: 3600 (or default)
```

### **CNAME Records (for www subdomain)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

### **MX Records (for Google Workspace email)**
```
Type: MX
Name: @ (or leave blank)
Value: 1 ASPMX.L.GOOGLE.COM
Priority: 1
TTL: 3600

Type: MX
Name: @ (or leave blank)
Value: 5 ALT1.ASPMX.L.GOOGLE.COM
Priority: 5
TTL: 3600

Type: MX
Name: @ (or leave blank)
Value: 5 ALT2.ASPMX.L.GOOGLE.COM
Priority: 5
TTL: 3600

Type: MX
Name: @ (or leave blank)
Value: 10 ALT3.ASPMX.L.GOOGLE.COM
Priority: 10
TTL: 3600

Type: MX
Name: @ (or leave blank)
Value: 10 ALT4.ASPMX.L.GOOGLE.COM
Priority: 10
TTL: 3600
```

### **TXT Records (for Google Workspace verification)**
```
Type: TXT
Name: @ (or leave blank)
Value: google-site-verification=your_verification_code
TTL: 3600
```

## 📧 **Step 2: Google Workspace Setup**

### **Sign Up for Google Workspace**
1. Go to [Google Workspace](https://workspace.google.com/)
2. Choose the plan that fits your needs (Business Starter is usually sufficient)
3. Enter your domain: `thepmuguide.com`
4. Complete the verification process

### **Verify Domain Ownership**
1. Google will provide a verification code
2. Add the TXT record above with your verification code
3. Wait for DNS propagation (can take up to 48 hours)
4. Complete verification in Google Workspace

### **Set Up Email Accounts**
1. Create your admin account: `admin@thepmuguide.com`
2. Set up additional accounts as needed:
   - `support@thepmuguide.com`
   - `info@thepmuguide.com`
   - `billing@thepmuguide.com`

## 🚀 **Step 3: Add Domain to Vercel**

### **Through Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `pmu-pro` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter `thepmuguide.com`
6. Follow the verification steps

### **Through Vercel CLI**
```bash
vercel domains add thepmuguide.com
```

## ⚙️ **Step 4: Update Application Configuration**

### **Environment Variables**
Add these to your `.env.local` file:
```bash
# Domain Configuration
NEXT_PUBLIC_DOMAIN=thepmuguide.com
NEXT_PUBLIC_SITE_URL=https://thepmuguide.com

# Email Configuration
EMAIL_FROM=admin@thepmuguide.com
EMAIL_REPLY_TO=support@thepmuguide.com

# Company Information
NEXT_PUBLIC_COMPANY_NAME=The PMU Guide
NEXT_PUBLIC_COMPANY_EMAIL=admin@thepmuguide.com
```

### **Update Company Information**
The application now uses centralized company information from `lib/billing-config.ts`:
```typescript
export const COMPANY_INFO = {
  name: 'The PMU Guide',
  domain: 'thepmuguide.com',
  email: 'admin@thepmuguide.com',
  supportEmail: 'support@thepmuguide.com',
  website: 'https://thepmuguide.com'
}
```

## 🔍 **Step 5: Verify Setup**

### **Check Website**
1. Visit `https://thepmuguide.com`
2. Ensure it loads your PMU Pro application
3. Check that `https://www.thepmuguide.com` redirects properly

### **Check Email**
1. Send a test email to `admin@thepmuguide.com`
2. Verify you can receive emails
3. Test sending emails from your Google Workspace account

### **Check DNS Propagation**
Use these tools to verify DNS setup:
- [MXToolbox](https://mxtoolbox.com/)
- [DNS Checker](https://dnschecker.org/)
- [WhatsMyDNS](https://www.whatsmydns.net/)

## 🚨 **Common Issues & Solutions**

### **Domain Not Loading**
- Check A record points to `76.76.19.36`
- Verify CNAME for www subdomain
- Wait for DNS propagation (up to 48 hours)

### **Email Not Working**
- Verify MX records are correct
- Check Google Workspace verification is complete
- Ensure domain ownership is verified

### **SSL Certificate Issues**
- Vercel automatically provides SSL certificates
- Wait for certificate generation (usually 24-48 hours)
- Check Vercel dashboard for certificate status

## 📱 **Step 6: Update Application References**

### **Update Meta Tags**
Update your layout files to use the new domain:
```typescript
export const metadata = {
  title: 'The PMU Guide - Professional PMU Tools',
  description: 'Professional PMU analysis tools and client management',
  url: 'https://thepmuguide.com',
  // ... other meta tags
}
```

### **Update Links**
Ensure all internal links use the new domain:
- Navigation links
- Footer links
- Social media links
- Email templates

## 🎉 **Final Steps**

### **Test Everything**
1. ✅ Website loads at `thepmuguide.com`
2. ✅ Email works with `admin@thepmuguide.com`
3. ✅ All features work properly
4. ✅ SSL certificate is active

### **Update External Services**
1. Update Stripe webhook endpoints
2. Update any third-party integrations
3. Update social media profiles
4. Update business listings

## 📞 **Need Help?**

If you encounter issues:
1. Check DNS propagation status
2. Verify all DNS records are correct
3. Check Vercel dashboard for domain status
4. Contact your domain registrar for DNS issues
5. Contact Google Workspace support for email issues

## 🚀 **Your New Professional Setup**

Once complete, you'll have:
- **Professional Domain**: `thepmuguide.com`
- **Professional Email**: `admin@thepmuguide.com`
- **SSL Certificate**: Automatic HTTPS
- **Email Hosting**: Google Workspace
- **Website Hosting**: Vercel

**This gives you a completely professional online presence for your PMU business!** 🎯✨
