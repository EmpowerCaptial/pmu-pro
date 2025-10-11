# 🏦 Hybrid Payment System - Complete Guide

## ✅ System Deployed & Active

The PMU Pro platform now supports a flexible hybrid payment system that allows studio owners to choose how each team member is paid.

---

## 📊 Payment Models Supported

### 1. **Commissioned Artist** 💰
- All client payments → Owner's Stripe account
- Owner pays artist a percentage commission
- Owner controls all money flow
- Best for: Salaried staff, new artists, tight financial control

### 2. **Booth Renter** 🏢
- Client payments → Artist's own Stripe account
- Artist pays owner monthly booth rent
- Artist has full control of their money
- Best for: Independent contractors, experienced artists

### 3. **Student** 📚
- All payments → Owner's Stripe account (100%)
- No commission to student
- Owner supervises and keeps all revenue
- Automatic for all student roles

---

## 🎯 How It Works

### **For Studio Owners:**

#### **Step 1: Set Employment Type**
1. Go to **Studio → Team Management**
2. Find instructor/licensed artist
3. Click **⋮** menu → **Set Employment Type**
4. Choose:
   - **Commissioned**: Set commission % (e.g., 60%)
   - **Booth Renter**: Set monthly rent (e.g., $500)

#### **Step 2: Track Commissions**
- Dashboard shows "Commission & Payments" card
- See pending commissions owed
- View breakdown by staff member
- Click "Manage Commissions" for details

#### **Step 3: Pay Commissions**
- Go to **Studio → Commissions**
- See each staff member's earnings
- Click "Mark as Paid" when you pay them
- Record payment method (cash/check/Venmo/etc.)

---

### **For Commissioned Staff:**

**What You See on Dashboard:**
- Total revenue you generated
- Your commission earned (e.g., 60% of $400 = $240)
- Studio share (e.g., 40% = $160)
- Pending vs. paid commissions

**How You Get Paid:**
- Owner receives all client payments
- Owner pays you separately (outside the system)
- You track what's owed via dashboard
- No Stripe account needed

---

### **For Booth Renters:**

**What You See on Dashboard:**
- Total revenue (goes to YOUR Stripe)
- Monthly booth rent amount
- Direct payout control

**How You Get Paid:**
- Clients pay YOUR Stripe account directly
- You keep 100% of service revenue
- You pay owner booth rent separately
- Must have own Stripe Connect account

---

### **For Students:**

**What You See on Dashboard:**
- Total revenue generated under supervision
- Services completed count
- Note: "All payments go to studio owner"

**How Payment Works:**
- 100% to owner (you're learning)
- No commission earned
- Owner handles all money
- No Stripe account needed

---

## 💻 Technical Implementation

### **Database Schema:**

```prisma
model User {
  employmentType   String?  // "commissioned" or "booth_renter"
  commissionRate   Float?   // 0-100 percentage
  boothRentAmount  Float?   // Monthly rent amount
}

model CommissionTransaction {
  id               String
  ownerId          String
  staffId          String
  amount           Float
  commissionRate   Float
  commissionAmount Float
  ownerAmount      Float
  status           String  // "pending" or "paid"
  paidAt           DateTime?
  paidMethod       String?
}
```

### **Payment Routing Logic:**

```typescript
// lib/payment-routing.ts
getPaymentRouting(serviceProviderId, amount)

Rules:
1. IF student → Owner's Stripe (100%)
2. IF commissioned → Owner's Stripe (track commission)
3. IF booth_renter → Staff's Stripe (direct)
4. IF owner → Owner's Stripe
```

### **Commission Tracking:**

```typescript
recordCommissionTransaction(
  ownerId,
  staffId,
  amount,
  commissionRate,
  employmentType
)
```

---

## 🔒 Security & Validation

### **Authorization:**
- ✅ Only owners/managers can set employment types
- ✅ Staff can only view their own earnings
- ✅ Owners can only manage their own studio's commissions

### **Data Validation:**
- ✅ Commission rate: 0-100%
- ✅ Booth rent: positive numbers only
- ✅ Employment type: "commissioned" or "booth_renter" only
- ✅ Students always route to owner (hardcoded)

---

## 📱 User Experience

### **Owner Dashboard:**
```
┌─────────────────────────────────────┐
│ 💰 Commission & Payments            │
│                                      │
│ Total Revenue: $3,450                │
│ You Keep: $1,725                     │
│ Commission Owed: $1,725              │
│                                      │
│ By Staff:                            │
│ • Mya (60%): $720 owed               │
│ • Ally (55%): $550 owed              │
│                                      │
│ [Manage Commissions →]               │
└─────────────────────────────────────┘
```

### **Staff Dashboard (Commissioned):**
```
┌─────────────────────────────────────┐
│ 💰 Your Earnings                     │
│ Commissioned Artist (60%)            │
│                                      │
│ Revenue Generated: $1,200            │
│ Your Commission: $720                │
│ Studio Share: $480                   │
│                                      │
│ Pending: $720                        │
│ Paid: $0                             │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### **Test 1: Add Commissioned Artist**
1. Owner adds new instructor with 60% commission
2. Instructor completes $400 service
3. Payment → Owner's Stripe ✅
4. Commission tracked: $240 owed to instructor ✅
5. Owner dashboard shows $240 pending ✅
6. Instructor dashboard shows $240 earned ✅

### **Test 2: Add Booth Renter**
1. Owner adds licensed artist as booth renter ($500/mo)
2. Artist connects their Stripe account
3. Artist completes $400 service
4. Payment → Artist's Stripe ✅
5. No commission tracked ✅
6. Artist dashboard shows $400 in their account ✅

### **Test 3: Student Booking**
1. Jenny (student) books supervision session
2. Client pays $400
3. Payment → Owner's Stripe ✅
4. No commission tracked ✅
5. Jenny dashboard shows "Revenue generated: $400" ✅

---

## ⚙️ Configuration Options

### **Commission Rates (Typical):**
- New artists: 40-50%
- Experienced artists: 55-65%
- Senior artists: 70-80%
- Students: 0% (always)

### **Booth Rent (Typical):**
- Small booth: $300-500/month
- Large booth: $600-1000/month
- Premium location: $1000+/month

---

## 🚀 Future Enhancements

**Potential Additions:**
- Auto-calculate booth rent based on service count
- Tiered commission (increases with performance)
- Automated commission payments via Stripe
- Tax reporting (1099 generation)
- Multi-currency support
- Payment schedules (weekly/monthly)

---

## 📞 Support

**For Owners:**
- Visit: `/studio/commissions` to manage payments
- Team settings: `/studio/team`
- Questions: Contact support

**For Staff:**
- View earnings on your dashboard
- Employment questions: Ask your studio owner
- Payment issues: Contact your studio owner

---

## ✅ System Status

**Deployed:** October 11, 2025  
**Status:** Production Ready ✅  
**Database:** Updated ✅  
**UI:** Complete ✅  
**APIs:** Tested ✅  
**Payment Routing:** Active ✅  

---

**Built for:** Universal Beauty Studio Academy  
**Tested with:** Tyrone (owner), Jenny (student), Mya/Tierra/Ally (instructors)

