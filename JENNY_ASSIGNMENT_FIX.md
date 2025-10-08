# Fix: Jenny Can't See Assigned Services

## The Problem

Jenny sees "No services assigned" even though services were assigned and saved. This happens when **Jenny's login user ID doesn't match the ID used in service assignments**.

## Root Cause

There are TWO places where user IDs are stored:
1. **Team Members** (in localStorage: `studio-team-members`) - Used when assigning services
2. **Login Account** (database or demo-user in localStorage) - Used when filtering services

If these IDs don't match, Jenny won't see her assigned services!

## Quick Fix (Browser Console Method)

### Step 1: Get Jenny's Login ID

1. **Log in as Jenny**
2. Open browser console (F12)
3. Paste this code:

```javascript
const user = JSON.parse(localStorage.getItem('demo-user') || sessionStorage.getItem('current-user') || '{}');
console.log('Jenny\'s Login ID:', user.id);
console.log('Copy this ID:', user.id);
```

4. **Copy Jenny's ID** that appears

### Step 2: Check Team Member ID

1. **Stay logged in as Jenny** (or log in as owner)
2. In console, paste:

```javascript
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const jenny = teamMembers.find(m => m.name.toLowerCase().includes('jenny'));
console.log('Jenny in team members:', jenny);
console.log('Team Member ID:', jenny?.id);
```

3. **Compare the two IDs** - Do they match?

### Step 3: Fix the Mismatch

If the IDs don't match, run this automated fix:

1. **Log in as Owner/Manager**
2. Open browser console (F12)
3. Paste and run this complete fix script:

```javascript
// Get Jenny's login ID (recorded when she logged in)
const jennyLoginId = prompt('Paste Jenny\'s Login ID from Step 1:');

if (!jennyLoginId) {
  alert('Please provide Jenny\'s login ID');
} else {
  // Fix team members
  const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
  const jennyIndex = teamMembers.findIndex(m => m.name.toLowerCase().includes('jenny'));
  
  if (jennyIndex >= 0) {
    const oldId = teamMembers[jennyIndex].id;
    teamMembers[jennyIndex].id = jennyLoginId;
    localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
    console.log('✅ Updated team member ID:', oldId, '→', jennyLoginId);
    
    // Fix service assignments
    const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
    const updatedAssignments = assignments.map(a => {
      if (a.userId === oldId) {
        return { ...a, userId: jennyLoginId };
      }
      return a;
    });
    localStorage.setItem('service-assignments', JSON.stringify(updatedAssignments));
    
    const jennyCount = updatedAssignments.filter(a => a.userId === jennyLoginId && a.assigned).length;
    console.log('✅ Updated service assignments');
    console.log(`✅ Jenny now has ${jennyCount} services assigned`);
    alert(`✅ Fixed! Jenny now has ${jennyCount} services assigned.\n\nHave Jenny refresh her browser and try again.`);
  } else {
    alert('❌ Jenny not found in team members');
  }
}
```

### Step 4: Test

1. **Jenny logs in**
2. Goes to **Studio → Supervision Booking**
3. Follows the booking flow
4. Should now see assigned services! ✅

## Alternative: Manual Database Fix

If Jenny is using database authentication (not demo mode), you need to ensure her database user ID matches:

1. Find Jenny's database user ID:
```sql
SELECT id, name, email FROM users WHERE email = 'jenny@example.com';
```

2. Use that ID when assigning services in the UI

## Prevention: Always Use Database Users

To prevent this issue in the future:

1. **Create real user accounts** for team members in the database
2. Don't mix localStorage team members with database users
3. When inviting team members, create actual user accounts

## Still Having Issues?

Run the full diagnostic script in the browser console:

```javascript
// Copy contents of: scripts/debug-jenny-assignments.js
// Paste in browser console while logged in as Jenny
```

This will show:
- ✅ Jenny's exact login ID
- ✅ What IDs are in service assignments
- ✅ Whether there's a mismatch
- ✅ Detailed debug information

## Technical Explanation

### How Service Filtering Works

```typescript
// In supervision/page.tsx
if (currentUser?.role === 'student') {
  const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
  
  const assignedServices = services.filter(service => 
    assignments.some(assignment =>
      assignment.serviceId === service.id && 
      assignment.userId === currentUser.id &&  // ← This must match!
      assignment.assigned === true
    )
  )
}
```

The `currentUser.id` comes from the login session, but `assignment.userId` comes from the team member list. If these don't match, the filter returns an empty array = no services!

## Contact Support

If the above steps don't work:

1. Open browser console (F12)
2. Copy ALL console output when:
   - Loading the Service Assignments page
   - Saving assignments
   - Jenny trying to book supervision
3. Share the console logs for further investigation

---

**Last Updated**: October 8, 2025  
**Issue**: User ID mismatch between team members and login accounts

