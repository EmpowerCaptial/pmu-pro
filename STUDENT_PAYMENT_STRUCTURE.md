# Student Payment Structure

## 🎓 Why Students Don't See Stripe Connect

### The Issue (FIXED)
Students were seeing a "Connect Stripe" / "Payment Setup" button on their dashboard that didn't apply to them.

### Why This Was Wrong
1. **Students don't receive direct client payments** - They're in training
2. **Students are paid by the studio owner** - Separate from client transactions
3. **Connecting Stripe serves no purpose** for students
4. **Could create confusion** about how they'll be paid
5. **Could set false expectations** about direct earnings

---

## 💰 Payment Structure By Role

### 1. Students / Apprentices
**How They Get Paid:**
- ❌ NOT through Stripe Connect
- ❌ NOT directly from clients
- ✅ Paid by studio owner separately (hourly, weekly, etc.)
- ✅ Hours tracked via clock-in/clock-out system
- ✅ Owner reviews hours and pays them directly

**What They See:**
- Clock-in/Clock-out button (red → purple)
- Hours worked tracking
- Training progress
- NO Stripe Connect button
- NO payment processing options

**Why:**
- They're learning and practicing under supervision
- Work is supervised by instructors
- Studio owner maintains client relationships
- Owner handles all client payments
- Owner compensates students based on agreement

---

### 2. Instructors
**How They Get Paid:**
- ✅ Commission-based on supervised work
- ✅ Commission tracked automatically in system
- ✅ Owner sees commission owed on dashboard
- ✅ Owner pays them (via Stripe Connect OR separately)
- 💡 CAN set up Stripe Connect if owner wants to pay through platform

**What They See:**
- Staff Earnings card (shows commission owed)
- Stripe Connect option (optional for owner to use)
- Supervision booking system
- Commission tracking

**Why:**
- They supervise and approve student work
- Entitled to commission on supervised services
- Can receive payments through platform or direct from owner

---

### 3. Licensed Artists (Independent)
**How They Get Paid:**
- ✅ Direct payments from clients via Stripe
- ✅ MUST set up Stripe Connect
- ✅ Money goes directly to their account
- ✅ Platform takes service fee (if applicable)

**What They See:**
- Stripe Connect button (REQUIRED)
- Payment setup options
- Direct booking system
- Weekly/Daily balance cards
- Payout options

**Why:**
- They work independently
- Book their own clients
- Receive direct payments
- Manage their own pricing

---

### 4. Studio Owners
**How They Get Paid:**
- ✅ All client payments for supervised work
- ✅ Commission payments from licensed artists (if renting space)
- ✅ MUST set up Stripe Connect
- ✅ See all financial dashboards

**What They See:**
- Stripe Connect button (REQUIRED)
- Commission Summary (what they owe staff)
- Staff Earnings tracking
- All payment management tools
- Studio financial dashboards

**Why:**
- They own the business
- Responsible for all financials
- Pay students and instructors
- Receive all supervised work payments

---

## 🔧 What Was Fixed

### Before Fix:
```typescript
// ALL users saw this card (WRONG!)
<Card>
  <CardTitle>Payment Setup</CardTitle>
  <Link href="/stripe-connect">
    Connect Stripe
  </Link>
</Card>
```

### After Fix:
```typescript
// Only owners, instructors, and licensed artists see it (CORRECT!)
{currentUser?.role !== 'student' && (
  <Card>
    <CardTitle>Payment Setup</CardTitle>
    <Link href="/stripe-connect">
      Connect Stripe
    </Link>
  </Card>
)}
```

---

## 📊 Student Payment Workflow

### How Students Track & Get Paid:

1. **Arrival at Studio**
   - Click red clock icon 🔴
   - System checks location (must be at studio)
   - Clocks in successfully
   - Icon turns purple 🟣

2. **During Work**
   - Purple clock shows they're clocked in
   - Hours accumulate automatically
   - Location monitored (auto clock-out if they leave)

3. **End of Shift**
   - Click purple clock icon
   - Clocks out successfully
   - Icon turns red 🔴
   - Total hours calculated

4. **Payment Time** (Weekly/Bi-weekly)
   - Owner reviews total hours worked
   - Owner calculates payment based on agreement
     - Example: $15/hour × 20 hours = $300
   - Owner pays student separately:
     - Direct deposit
     - Check
     - Cash
     - Venmo/CashApp
     - OR through Stripe Connect (owner's choice)

5. **No Client Interaction**
   - Students don't handle payments
   - Students don't see client payment info
   - Owner manages all client transactions
   - Clean separation of training vs business

---

## ✅ Benefits of This Structure

### For Students:
- ✓ Focus on learning, not payments
- ✓ Clear expectations (paid for hours worked)
- ✓ No confusion about client payments
- ✓ Simple clock-in/out system
- ✓ Owner handles all financial complexity

### For Owners:
- ✓ Control over client relationships
- ✓ Direct payment from clients
- ✓ Pay students on your schedule
- ✓ Track student hours accurately
- ✓ Choose how to compensate students

### For Instructors:
- ✓ Commission tracked automatically
- ✓ Clear visibility into earnings
- ✓ Can receive payments via platform or direct
- ✓ No client payment handling

### For Licensed Artists:
- ✓ Direct control over income
- ✓ Immediate access to payments
- ✓ Independent business operation
- ✓ Full financial transparency

---

## 🚫 What Students Should NOT See

- ❌ Stripe Connect button
- ❌ "Payment Setup" card
- ❌ Client payment processing
- ❌ Payout options
- ❌ Commission tracking (not applicable)
- ❌ Stripe account linking

## ✅ What Students SHOULD See

- ✅ Clock-in/Clock-out button
- ✅ Hours worked today
- ✅ Training progress
- ✅ Supervision booking (to book with instructors)
- ✅ Dashboard with student-specific features

---

## 📝 Example Scenario

**Jenny (Student) Dashboard:**

```
Dashboard
├── 🔴 Clock In (when not clocked in)
├── 🟣 Clocked in since 9:00 AM (when clocked in)
├── 📚 Training Hours: 45 hours this month
├── ✅ Completed Procedures: 12
├── 📅 Upcoming Supervisions: 2
├── 🎓 Supervision Booking (find instructors)
└── NO Stripe Connect button
```

**Tyrone (Owner) Dashboard:**

```
Dashboard
├── 💰 Weekly Balance: $2,450
├── 💳 Daily Balance: $340
├── 📊 Commission Owed: $245
├── 👥 Staff Earnings: View all
├── 💳 Payment Setup → Connect Stripe
└── 🏢 Studio Management
```

---

## 🎯 Summary

**Fixed:** Removed Stripe Connect button from student dashboard

**Why:** Students don't receive direct client payments - they're paid by owner for hours worked

**Impact:** 
- ✅ No more confusion for students
- ✅ Clear payment expectations
- ✅ Cleaner student dashboard
- ✅ Students focus on training, not payments

**Status:** ✅ Live on production

---

**Date:** October 13, 2025  
**Issue:** Students seeing irrelevant Stripe Connect option  
**Solution:** Role-gated Stripe Connect to exclude students

