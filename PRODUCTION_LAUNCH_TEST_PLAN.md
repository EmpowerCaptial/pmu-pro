# 🚀 PRODUCTION LAUNCH TEST PLAN
**Launch Date:** October 12, 2025 (Ads go live tomorrow)

---

## ✅ PRE-LAUNCH AUTOMATED CHECKS

Run before any manual testing:
```bash
node scripts/production-readiness-check.js
```

---

## 👤 ROLE-BASED TESTING GUIDE

### **ROLE 1: NEW SUBSCRIBER (Critical Path)**

**Scenario:** Brand new studio owner signs up

#### **Test 1.1: Account Creation**
- [ ] Visit `/auth/signup`
- [ ] Enter email, name, password
- [ ] Select "Studio" plan
- [ ] Account created successfully
- [ ] **Expected:** Redirected to dashboard
- [ ] **Check:** No errors in console

#### **Test 1.2: First Login & Onboarding**
- [ ] Dashboard loads without errors
- [ ] Studio setup banner appears (or can be dismissed)
- [ ] Can access all features
- [ ] **Expected:** Smooth first impression
- [ ] **Check:** No infinite redirects

#### **Test 1.3: Add First Team Member**
- [ ] Go to Studio → Team (from dashboard)
- [ ] Click "Add Team Member"
- [ ] Enter: Name, Email, Password, Role (Instructor)
- [ ] Save
- [ ] **Expected:** Member appears in list
- [ ] **Check:** Member has correct `studioName` (same as owner)

#### **Test 1.4: Set Employment Type**
- [ ] Find new instructor in team list
- [ ] Click ⋮ menu → "Set Employment Type"
- [ ] Modal has WHITE background (readable)
- [ ] Choose "Commissioned" at 60%
- [ ] Save
- [ ] **Expected:** Badge shows "💰 60% Commission"
- [ ] **Check:** No errors

#### **Test 1.5: Assign Services**
- [ ] Go to Service Assignments (from team page)
- [ ] Create a service (if none exist)
- [ ] Assign service to instructor
- [ ] Save
- [ ] **Expected:** Service assigned
- [ ] **Check:** Database updated

---

### **ROLE 2: OWNER (Tyrone)**

#### **Test 2.1: Dashboard**
- [ ] Log in as owner
- [ ] Dashboard loads completely
- [ ] See: Weekly Balance, Daily Balance, Commission Summary
- [ ] No infinite re-render errors
- [ ] **Expected:** All cards show $0.00 for new account
- [ ] **Check:** No React error #310

#### **Test 2.2: Team Management**
- [ ] Navigate: Dashboard → Studio Management → Team
- [ ] See all team members (Tierra, Mya, Ally, Jenny)
- [ ] Each shows correct role
- [ ] Employment badges visible (if set)
- [ ] ⚠️ warnings for unset employment types
- [ ] **Expected:** Clean, organized list
- [ ] **Check:** All 4 instructors + 1 student visible

#### **Test 2.3: Employment Settings**
- [ ] Click ⋮ on Mya → "Set Employment Type"
- [ ] Modal opens with WHITE background
- [ ] Set Commissioned at 60%
- [ ] Calculate: $400 service → Mya $240, Owner $160
- [ ] Save
- [ ] **Expected:** Success message, badge updates
- [ ] **Check:** Database updated

#### **Test 2.4: Commission Management**
- [ ] Dashboard → Studio Management → Pay (Commissions)
- [ ] See commission summary page
- [ ] Shows $0 (no transactions yet)
- [ ] **Expected:** Page loads cleanly
- [ ] **Check:** No errors

#### **Test 2.5: Service Creation**
- [ ] Go to Services page
- [ ] Create new service: "Test Service", $400
- [ ] Save
- [ ] **Expected:** Service appears
- [ ] **Check:** Owner's email/ID correctly saved

#### **Test 2.6: Remove Team Member**
- [ ] Add test member
- [ ] Remove test member
- [ ] **Expected:** Deleted from database AND localStorage
- [ ] **Check:** No orphaned data

---

### **ROLE 3: INSTRUCTOR (Mya/Tierra/Ally)**

#### **Test 3.1: Login**
- [ ] Log in as instructor
- [ ] Dashboard loads
- [ ] See: Weekly Balance, Daily Balance, **Your Earnings** card
- [ ] **Expected:** Earnings card shows employment type
- [ ] **Check:** studioName saved to localStorage

#### **Test 3.2: Earnings Display**
- [ ] Check "Your Earnings" card
- [ ] If commissioned: Shows commission rate
- [ ] If not set: Shows warning "Payment Type Not Set"
- [ ] **Expected:** Clear communication
- [ ] **Check:** No errors

#### **Test 3.3: Supervision Access**
- [ ] Go to Supervision page (if instructor)
- [ ] See availability management tab
- [ ] Can set availability
- [ ] Can view student bookings
- [ ] **Expected:** Full instructor features
- [ ] **Check:** No permission errors

#### **Test 3.4: Regular Booking**
- [ ] Go to /booking
- [ ] Create appointment for client
- [ ] Times show in 12-hour format (9:30 AM, not 09:30)
- [ ] Complete booking
- [ ] **Expected:** Appointment created
- [ ] **Check:** Payment routing correct (based on employment type)

---

### **ROLE 4: STUDENT (Jenny)**

#### **Test 4.1: Login & Dashboard**
- [ ] Log in as Jenny (jenny@universalbeautystudio.com / temp839637)
- [ ] Dashboard loads
- [ ] See: Weekly Balance, Daily Balance, Your Earnings (student view)
- [ ] **NO BILLING BUTTON** (students shouldn't access billing)
- [ ] **Expected:** Clean student dashboard
- [ ] **Check:** studioName in localStorage

#### **Test 4.2: Instructor List**
- [ ] Go to Supervision Booking
- [ ] See instructor selection
- [ ] **Should see:** Tyrone, Tierra, Mya, Ally (4 instructors)
- [ ] **Should NOT see:** Sarah Johnson, Test Frontend, Working Test (fake instructors)
- [ ] **Expected:** Only real instructors
- [ ] **Check:** No fake data

#### **Test 4.3: Service Selection**
- [ ] Select instructor (e.g., Mya)
- [ ] Select date (October 24)
- [ ] Select time (9:30 AM - in 12-hour format)
- [ ] **Should see:** Assigned services only
- [ ] **Expected:** 7 services (Lip Blush, Microblading, etc.)
- [ ] **Check:** Yellow warning if no services

#### **Test 4.4: Complete Booking**
- [ ] Enter client info
- [ ] Submit booking
- [ ] **Expected:** Success message
- [ ] **Check:** Payment goes to OWNER's Stripe (not Jenny's)

#### **Test 4.5: Features Access**
- [ ] Go to /features
- [ ] **Should NOT see:** Billing button/card
- [ ] **Should see:** Client intake, analysis, etc.
- [ ] **Expected:** Limited access appropriate for students
- [ ] **Check:** No unauthorized access

---

## 🔒 SECURITY CRITICAL TESTS

### **S1: Authentication**
- [ ] Logout → Redirected to login
- [ ] Invalid credentials → Error message
- [ ] No access to /dashboard without login
- [ ] **Expected:** Secure session management

### **S2: Authorization**
- [ ] Student can't access /studio/team
- [ ] Student can't access /studio/commissions
- [ ] Instructor can't modify owner settings
- [ ] **Expected:** Role-based access control working

### **S3: Data Isolation**
- [ ] Students only see their studio's data
- [ ] Can't access other studios' data
- [ ] **Expected:** Studio-level data isolation

---

## 💰 PAYMENT FLOW TESTS

### **P1: Student Booking Payment**
- [ ] Jenny books supervision session ($400)
- [ ] Payment should route to: **Owner's Stripe**
- [ ] Commission recorded: **NO** (students = 0%)
- [ ] **Expected:** 100% to owner

### **P2: Commissioned Artist Payment**
- [ ] Mya (60% commission) books client ($400)
- [ ] Payment should route to: **Owner's Stripe**
- [ ] Commission recorded: **YES** ($240 to Mya, $160 to owner)
- [ ] **Expected:** Commission transaction created

### **P3: Booth Renter Payment**
- [ ] Set instructor as booth renter
- [ ] They book client ($400)
- [ ] Payment should route to: **Their Stripe**
- [ ] Commission recorded: **NO**
- [ ] **Expected:** Direct payment

---

## 🐛 BUG REGRESSION TESTS

### **BR1: Fake Instructors**
- [ ] Log in as Jenny
- [ ] Go to supervision booking
- [ ] Check instructor list
- [ ] **Must NOT see:** Sarah Johnson, Test Frontend Fix, Working Test Artist
- [ ] **Expected:** Only real instructors

### **BR2: Studio Name Persistence**
- [ ] Add new team member
- [ ] Check their `studioName` in database
- [ ] **Must be:** "Universal Beauty Studio Academy"
- [ ] **Must NOT be:** "Tyrone Jackson" or null
- [ ] **Expected:** Correct studio auto-assigned

### **BR3: Login Studio Name**
- [ ] Log out and log in as any user
- [ ] Check localStorage: `demoUser`
- [ ] **Must have:** `studioName` field populated
- [ ] **Expected:** Login saves complete data

### **BR4: Onboarding Loop**
- [ ] Log in as owner
- [ ] Dashboard loads
- [ ] **Must NOT:** Redirect to onboarding repeatedly
- [ ] **Expected:** Can dismiss setup banner

### **BR5: Time Format**
- [ ] Create appointment
- [ ] View appointment list
- [ ] **Must show:** "9:30 AM", "1:00 PM" (12-hour)
- [ ] **Must NOT show:** "09:30", "13:00" (24-hour)
- [ ] **Expected:** Consistent 12-hour format

---

## 🚨 CRITICAL ISSUES TO CHECK

### **C1: Database Connection**
```bash
node scripts/verify-database-connection.js
```
- [ ] Production database accessible
- [ ] No connection timeouts
- [ ] Schema matches Prisma

### **C2: Stripe Integration**
- [ ] Owner has Stripe connected (or clear path to connect)
- [ ] Payment API endpoints functional
- [ ] Webhook endpoints (if any) configured

### **C3: Email Service**
- [ ] Team invitations send emails
- [ ] Email service credentials set
- [ ] Test email delivery

### **C4: Service Worker / PWA**
- [ ] Service worker not caching stale API data
- [ ] PWA manifest valid
- [ ] Offline mode works (or gracefully degrades)

### **C5: Mobile Responsiveness**
- [ ] Mobile navbar doesn't cover buttons
- [ ] Modals readable on mobile
- [ ] Forms usable on phone screens

---

## 📊 PERFORMANCE TESTS

### **P1: Page Load Times**
- [ ] Dashboard < 3 seconds
- [ ] Booking page < 2 seconds
- [ ] Team page < 2 seconds

### **P2: API Response Times**
- [ ] /api/appointments < 1 second
- [ ] /api/services < 1 second
- [ ] /api/studio/team-members < 1 second

### **P3: Build Size**
- [ ] Check bundle size is reasonable
- [ ] No massive JavaScript chunks

---

## 🎯 SMOKE TEST (Quick 5-Minute Check)

**Run before launch:**

1. **Owner Flow (2 min):**
   - Log in → Dashboard loads → Add team member → Assign service → Set employment type

2. **Student Flow (2 min):**
   - Log in as Jenny → See 4 instructors → Select instructor → Book session → Complete

3. **Instructor Flow (1 min):**
   - Log in as Mya → Dashboard shows earnings → View supervision access

**All 3 must pass without errors!**

---

## 📋 LAUNCH DAY CHECKLIST

**Morning of Oct 12:**
- [ ] Run: `node scripts/production-readiness-check.js`
- [ ] Verify: No critical errors
- [ ] Test: One booking as each role
- [ ] Check: Vercel deployment status (green)
- [ ] Monitor: Error logs for first hour
- [ ] Have: Quick rollback plan ready

---

## 🆘 EMERGENCY CONTACTS

**If critical issue found:**
1. Check Vercel dashboard for errors
2. Check Prisma dashboard for database issues
3. Revert last deploy if needed: `git revert HEAD && git push`
4. Contact: [Your support contact]

---

**Status:** Ready for testing
**Next:** Run automated checks, then manual role tests

