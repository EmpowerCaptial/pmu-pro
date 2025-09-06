# 🚀 Meta Business AI Integration Setup Guide

## 🎯 **What This System Does:**

- **AI sits in Meta Messenger** waiting for customer messages
- **Automatically books appointments** based on artist availability
- **Artist can choose** between AI Assistant or Manual Response
- **24/7 customer service** without artist intervention

## 🔧 **Setup Steps:**

### **Step 1: Environment Variables**

Add these to your `.env.local` file:

```bash
# Meta Business Integration
META_VERIFY_TOKEN=pmu_pro_ai_2024
META_PAGE_ACCESS_TOKEN=your_page_access_token_here

# OpenAI/Groq API for AI responses
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### **Step 2: Meta Business Setup**

1. **Go to [Meta for Developers](https://developers.facebook.com/)**
2. **Create a new app** or use existing
3. **Add Messenger product** to your app
4. **Get Page Access Token** from your Facebook page
5. **Set up webhook** with URL: `https://yourdomain.com/api/meta/webhook`
6. **Verify token**: `pmu_pro_ai_2024`

### **Step 3: Artist Configuration**

1. **Artist logs into PMU Guide**
2. **Go to AI Assistant** in profile dropdown
3. **Configure AI settings**:
   - Response mode (AI/Manual/Hybrid)
   - Business hours
   - Available services
   - Custom greeting
4. **Connect Facebook page**
5. **Save settings**

## 🎮 **How It Works:**

### **AI Assistant Mode:**
- **Customer messages** → AI processes automatically
- **AI books appointments** → Sends confirmations
- **Artist gets notified** → Can review/override if needed

### **Manual Response Mode:**
- **Customer messages** → Artist gets notification
- **Artist responds** → Full control over interaction
- **AI provides suggestions** → But doesn't auto-respond

### **Hybrid Mode:**
- **Basic inquiries** → AI handles automatically
- **Complex requests** → Routes to artist
- **Best of both worlds** → Efficiency + personal touch

## 📱 **Customer Experience:**

**Customer:** "Hi, I'd like to book a microblading appointment"

**AI:** "Hi! I'd be happy to help you book a microblading appointment. I can see available slots on Tuesday at 2 PM, Wednesday at 10 AM, or Friday at 3 PM. Which works best for you?"

**Customer:** "Tuesday at 2 PM works great!"

**AI:** "Perfect! I've booked your microblading appointment for Tuesday at 2 PM. You'll receive a confirmation email shortly. Is there anything else you'd like to know about your appointment?"

## 🔄 **Artist Control:**

### **Dashboard Notifications:**
- **New message alerts** in real-time
- **Appointment booking summaries**
- **AI response logs** for review
- **Quick override options**

### **Settings Control:**
- **Enable/disable AI** anytime
- **Switch modes** (AI/Manual/Hybrid)
- **Customize responses** and greetings
- **Set business rules** and availability

## 🚀 **Benefits:**

- **24/7 availability** for customer inquiries
- **Instant appointment booking** without waiting
- **Reduced manual work** for artists
- **Professional, consistent** customer service
- **Seamless integration** with existing systems

## 🔒 **Security & Privacy:**

- **Webhook verification** ensures legitimate requests
- **Artist data isolation** (each artist's settings separate)
- **No customer data storage** in AI responses
- **Compliant with Meta's** privacy policies

## 📋 **Next Steps:**

1. **Deploy the system** to your domain
2. **Set up environment variables**
3. **Configure Meta Business webhook**
4. **Test with a sample page**
5. **Onboard artists** to use the system

## 🎉 **Result:**

**Every artist gets their own AI assistant** that works 24/7, books appointments automatically, and provides professional customer service while maintaining full control over their business interactions!

---

**Need help?** The system is designed to be plug-and-play once the Meta Business integration is configured!



