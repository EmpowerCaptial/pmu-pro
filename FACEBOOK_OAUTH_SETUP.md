# Facebook OAuth Integration Setup

## 🔧 **Environment Variables Required**

Add these to your `.env.local` file:

```bash
# Facebook App Configuration (YOUR Facebook App)
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Public Facebook Client ID (for frontend)
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your_facebook_app_id

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=https://thepmuguide.com

# OpenAI Configuration (YOUR OpenAI API Key)
OPENAI_API_KEY=your_openai_api_key

# Database (already configured)
NEON_DATABASE_URL=your_neon_database_url
```

## 📋 **Facebook App Setup Instructions**

### **1. Create Facebook App**
1. Go to https://developers.facebook.com/
2. Click "Create App" → "Business" → "Next"
3. App Name: "PMU Pro" (or your preferred name)
4. App Contact Email: your email
5. Click "Create App"

### **2. Add Facebook Login Product**
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" → Click "Set Up"
3. Choose "Web" platform
4. Site URL: `https://thepmuguide.com`

### **3. Configure OAuth Redirect URIs**
In Facebook Login → Settings, add these Valid OAuth Redirect URIs:
- `https://thepmuguide.com/integrations/meta/callback`
- `http://localhost:3000/integrations/meta/callback` (for development)

### **4. Request Required Permissions**
In App Review → Permissions and Features, request:
- `email` (Basic)
- `public_profile` (Basic)
- `pages_show_list` (Advanced)
- `pages_read_engagement` (Advanced)
- `pages_manage_metadata` (Advanced)
- `instagram_basic` (Advanced)

### **5. Get Your App Credentials**
1. Go to Settings → Basic
2. Copy "App ID" → This is your `FACEBOOK_CLIENT_ID`
3. Copy "App Secret" → This is your `FACEBOOK_CLIENT_SECRET`

## 🚀 **How It Works for Artists**

### **Seamless User Experience:**
1. **Artist clicks "Connect with Facebook"**
2. **Redirected to Facebook** → Logs in with their account
3. **Authorizes PMU Pro app** → Grants page access
4. **Returns to PMU Pro** → Sees their Facebook pages
5. **Selects page** → Instagram automatically linked
6. **AI responses ready** → No technical knowledge required!

### **What Artists See:**
- ✅ **One-click connection**
- ✅ **No coding required**
- ✅ **No token management**
- ✅ **Automatic Instagram linking**
- ✅ **Professional experience**

### **What Happens Behind the Scenes:**
- 🔧 **PMU Pro handles all technical complexity**
- 🔧 **Your Facebook app manages OAuth**
- 🔧 **Your OpenAI key powers AI responses**
- 🔧 **Automatic token refresh**
- 🔧 **Secure token storage**

## 🎯 **Benefits of This Approach**

### **For Artists:**
- **Zero technical knowledge required**
- **Professional, seamless experience**
- **One-click Facebook connection**
- **Automatic Instagram integration**

### **For PMU Pro:**
- **Centralized control**
- **Professional integration**
- **Scalable for all artists**
- **No artist setup required**

## 🧪 **Testing the Integration**

### **1. Set Up Facebook App** (One-time)
- Follow the setup instructions above
- Add environment variables
- Deploy to production

### **2. Test Artist Flow**
- Go to `/integrations/meta`
- Click "Connect with Facebook"
- Verify seamless OAuth flow
- Test page selection
- Test AI responses

## 📊 **Production Checklist**

- [ ] Facebook App created and configured
- [ ] Environment variables added
- [ ] OAuth redirect URIs configured
- [ ] Required permissions requested
- [ ] OpenAI API key configured
- [ ] Integration tested end-to-end
- [ ] Deployed to production

## 🎉 **Result**

Artists get a **professional, seamless experience** with zero technical knowledge required, while you maintain full control over the integration!
