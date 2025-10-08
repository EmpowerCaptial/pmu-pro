# Service Assignment System Guide

## Overview

The Service Assignment System allows studio owners and managers to control which services each team member can perform. This ensures quality control and proper training oversight.

## 🎯 Key Features

### New UI Design (Less Scrolling!)
- **Team Member List**: See all team members in a clean, organized list on the left
- **Click to Assign**: Click any team member to view and toggle their services
- **Visual Indicators**: See at a glance how many services each person has assigned
- **Quick Assignment**: Toggle services on/off with a switch, no more scrolling through long lists

## 🔧 How to Use

### For Studio Owners/Managers

#### Step 1: Navigate to Service Assignments
1. Log in as an owner or manager
2. Go to **Studio → Service Assignments**

#### Step 2: Assign Services to Team Members
1. **Click on a team member's name** from the list on the left
2. You'll see all available services on the right side
3. **Toggle ON** the services this person is qualified to perform
4. **Toggle OFF** any services they shouldn't offer yet
5. Click **"Save Assignments"** when done

#### Step 3: Verify Assignments
- Check the count next to each member's name (e.g., "3 / 8" means 3 out of 8 services assigned)
- The summary at the bottom shows total assignments across all team members

### For Students

When you go to **Studio → Supervision Booking**:
- You'll only see services that have been assigned to you by your manager
- If no services appear, you'll see a yellow warning message
- Contact your studio manager to assign services to your account

## 🐛 Troubleshooting

### Problem: Student sees "No services available" in supervision booking

**Solution:**
1. Have the studio owner/manager log in
2. Go to **Studio → Service Assignments**
3. Find the student's name in the list
4. Click their name and assign the appropriate services
5. Click **"Save Assignments"**
6. Have the student refresh their browser and try again

### Problem: Services assigned but still not showing

**Debug Steps:**
1. Open browser console (F12)
2. Copy and paste the contents of `/scripts/test-service-assignment-flow.js`
3. Run it to see detailed diagnostic information
4. Follow the recommendations provided by the script

**Common Issues:**
- ❌ Assignments not saved (click "Save Assignments" button)
- ❌ Browser cache - try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- ❌ Wrong user ID - make sure the student is logged in with the correct account

## 🎓 Understanding Roles

### Student Role
- Can only book supervision sessions
- **Only sees assigned services** in the service dropdown
- Needs instructor supervision for all procedures
- All bookings go through the supervision workflow

### Licensed Artist Role
- Can book regular appointments
- **Only sees assigned services** in regular booking
- Can work independently (no supervision needed)

### Instructor Role
- Can supervise students
- **Sees all services** (can supervise any service)
- Can manage their availability for supervision sessions

### Owner/Manager Role
- **Full access** to service assignments
- Can assign/remove services for all team members
- Can see all services everywhere in the system

## 💡 Best Practices

### Assigning Services Strategically

**For New Students:**
- Start with 1-2 basic services
- Add more as they demonstrate competency
- Gradually expand their service list over time

**For Licensed Artists:**
- Assign services based on their training and certification
- Review and update assignments as they complete new training
- Remove services if quality concerns arise

**For Instructors:**
- Typically don't need assignments (see all services)
- But can be assigned specific services if you want to limit their scope

### Regular Review
- Review service assignments monthly
- Update based on:
  - Training completion
  - Quality of work
  - Client feedback
  - New services added to your menu

## 📊 Monitoring Assignment Activity

### Assignment Summary Card
At the bottom of the Service Assignments page, you'll see:
- **Total Services**: How many services exist in your system
- **Team Members**: Total number of team members
- **Active Assignments**: Total number of service assignments across all members

### Individual Team Member Cards
Each team member shows:
- Name and profile picture
- Role badge (Student, Licensed, Instructor)
- Assignment count (e.g., "3 / 8 services")

## 🔒 Security & Access Control

### Who Can Access Service Assignments?
- ✅ Studio Owners
- ✅ Studio Managers
- ✅ Directors
- ❌ Students
- ❌ Licensed Artists (without management role)

### Data Storage
- Service assignments are stored in **localStorage** (browser)
- Also synced to the **database** via API
- Make sure to click "Save Assignments" to persist changes

## 🚀 Quick Start Checklist

Setting up service assignments for the first time:

- [ ] Log in as studio owner/manager
- [ ] Navigate to Studio → Service Assignments
- [ ] For each team member:
  - [ ] Click their name
  - [ ] Toggle ON appropriate services
  - [ ] Verify the assignment count
- [ ] Click "Save Assignments"
- [ ] Test as a student:
  - [ ] Log in as a student
  - [ ] Go to Studio → Supervision Booking
  - [ ] Verify assigned services appear in the service dropdown
- [ ] Document which services each team member can perform

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Run the diagnostic script (`test-service-assignment-flow.js`)
3. Verify user roles and permissions
4. Check that services exist in the Services page first
5. Contact support with console logs and screenshots

## 🔄 Migration from Old System

If you were using the old scrolling interface:
- All existing assignments are preserved
- No data migration needed
- Simply navigate to the Service Assignments page to see the new interface
- The underlying data structure is the same

---

**Last Updated**: October 8, 2025  
**System Version**: 2.0 - Team Member First UI

