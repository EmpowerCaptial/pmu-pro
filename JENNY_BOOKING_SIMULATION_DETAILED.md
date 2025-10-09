# Jenny Booking Simulation - Step by Step

## Credentials
- **Email:** jenny@universalbeautystudio.com
- **Password:** jennyabshire
- **User ID:** cmgjmqeac0000j4nxuggrutfw
- **Role:** student

---

## Step 1: Jenny Logs In ✅

**URL:** https://thepmuguide.com/demo-login (or regular login)

**What Happens:**
```javascript
// On login, this data is stored in localStorage:
localStorage.setItem('demoUser', JSON.stringify({
  id: 'cmgjmqeac0000j4nxuggrutfw',
  email: 'jenny@universalbeautystudio.com',
  name: 'Jenny Smith',
  role: 'student',
  isRealAccount: true
}));
```

**Console Check (Press F12):**
```javascript
const user = JSON.parse(localStorage.getItem('demoUser'));
console.log('Logged in as:', user.name);
console.log('User ID:', user.id);
console.log('Role:', user.role);
```

**Expected Output:**
```
Logged in as: Jenny Smith
User ID: cmgjmqeac0000j4nxuggrutfw
Role: student
```

---

## Step 2: Navigate to Supervision Booking ✅

**URL:** https://thepmuguide.com/studio/supervision

**What Loads:**
1. Page reads currentUser from localStorage
2. Fetches instructors
3. **CRITICAL:** Calls `loadServices()` function

---

## Step 3: The Service Loading Function (WHERE THE PROBLEM IS)

**Code in `/app/studio/supervision/page.tsx` (lines 393-458):**

```javascript
useEffect(() => {
  const loadServices = async () => {
    if (!currentUser?.email) return
    
    setServicesLoading(true)
    try {
      // 1. Fetch services from API
      const services = await getServices(currentUser.email)
      const activeServices = services.filter(service => service.isActive)
      const mappedServices = activeServices.map(mapApiServiceToSupervisionService)
      
      console.log('🔍 Loading services for user:', {
        userId: currentUser.id,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        totalServices: mappedServices.length
      })
      
      // 2. IF STUDENT, FILTER BY ASSIGNMENTS
      if (currentUser?.role === 'student') {
        const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
        console.log('📋 All service assignments from localStorage:', assignments)
        console.log('🎯 Filtering for user ID:', currentUser.id)
        
        const assignedServices = mappedServices.filter(service => {
          const hasAssignment = assignments.some((assignment) => {
            const matches = assignment.serviceId === service.id && 
                           assignment.userId === currentUser.id && 
                           assignment.assigned === true
            return matches
          })
          return hasAssignment
        })
        
        console.log('✅ Student assigned services:', assignedServices.length, 'out of', mappedServices.length)
        
        if (assignedServices.length === 0) {
          console.warn('⚠️ WARNING: No services assigned to this student!')
        }
        
        setAvailableServices(assignedServices)
      } else {
        setAvailableServices(mappedServices)
      }
    } catch (error) {
      console.error('❌ Error loading services:', error)
      setAvailableServices([])
    } finally {
      setServicesLoading(false)
    }
  }

  loadServices()
}, [currentUser?.email, currentUser?.id, currentUser?.role])
```

**What Should Happen:**
1. ✅ Fetch services from API (Tyrone's services)
2. ✅ Get service assignments from localStorage
3. ✅ Match service IDs with assignment IDs
4. ✅ Filter to only show assigned services
5. ✅ Set `availableServices` state

**What's Probably Failing:**
One of these is true:
- ❌ `localStorage.getItem('service-assignments')` is empty
- ❌ Service IDs don't match between API and assignments
- ❌ User ID doesn't match in assignments
- ❌ `assigned` flag is false

---

## Step 4: Verify What's Actually Stored

**Run this in console (as Jenny or as Owner):**

```javascript
// Check what's actually stored
console.log('=== JENNY DIAGNOSTIC ===');

// 1. Current user
const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
console.log('1. Current User:');
console.log('   ID:', currentUser.id);
console.log('   Email:', currentUser.email);
console.log('   Role:', currentUser.role);

// 2. Service assignments
const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
console.log('\n2. Service Assignments:', assignments.length, 'total');

// 3. Jenny's assignments
const jennyAssignments = assignments.filter(a => a.userId === currentUser.id);
console.log('\n3. Jenny\'s Assignments:', jennyAssignments.length);
jennyAssignments.forEach(a => {
  console.log('   -', a.serviceId, '| assigned:', a.assigned);
});

// 4. Team members
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const jenny = teamMembers.find(m => m.email === 'jenny@universalbeautystudio.com');
console.log('\n4. Jenny in Team Members:');
console.log('   Found:', jenny ? 'YES' : 'NO');
if (jenny) {
  console.log('   ID:', jenny.id);
  console.log('   Matches login ID:', jenny.id === currentUser.id);
}

// 5. Summary
console.log('\n=== SUMMARY ===');
if (!jenny) {
  console.log('❌ PROBLEM: Jenny not in team members');
  console.log('   FIX: Run the setup script as owner');
} else if (jenny.id !== currentUser.id) {
  console.log('❌ PROBLEM: ID mismatch');
  console.log('   Team ID:', jenny.id);
  console.log('   Login ID:', currentUser.id);
  console.log('   FIX: Run the setup script to sync IDs');
} else if (jennyAssignments.length === 0) {
  console.log('❌ PROBLEM: No assignments found for Jenny');
  console.log('   FIX: Run the setup script to assign services');
} else {
  console.log('✅ Everything looks good!');
  console.log('   Jenny has', jennyAssignments.length, 'services assigned');
  console.log('   If services still don\'t show, the service IDs might not match');
}
```

---

## Step 5: The Yellow Warning Box

**Location:** `/app/studio/supervision/page.tsx` (lines 2404-2416)

```javascript
{availableServices.length === 0 && currentUser?.role === 'student' && (
  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-yellow-900 mb-1">No Services Assigned</p>
        <p className="text-yellow-800">
          Your studio owner or manager needs to assign services to you...
        </p>
      </div>
    </div>
  </div>
)}
```

**This shows when:** `availableServices.length === 0`

**Why it's showing:** The service filtering returned 0 services

---

## Most Likely Problem

**The service IDs in assignments don't match the service IDs from the API.**

**Why:** You might have run the setup script, but:
1. The script fetched services from API
2. Stored those service IDs in assignments
3. But then when the page loads, it might be getting DIFFERENT service IDs from the API

**Solution:** Run this diagnostic as Jenny:

```javascript
// Compare service IDs
async function compareServiceIds() {
  const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
  
  // Get services from API
  const response = await fetch('/api/services', {
    headers: { 'x-user-email': currentUser.email }
  });
  
  if (!response.ok) {
    console.error('API Error:', response.status);
    return;
  }
  
  const data = await response.json();
  const apiServices = data.services || [];
  
  console.log('📦 Services from API:', apiServices.length);
  apiServices.forEach(s => console.log('   API:', s.id, '-', s.name));
  
  // Get assignments
  const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
  const jennyAssignments = assignments.filter(a => a.userId === currentUser.id);
  
  console.log('\n📋 Jenny\'s Assignments:', jennyAssignments.length);
  jennyAssignments.forEach(a => console.log('   Assignment:', a.serviceId));
  
  // Check for matches
  console.log('\n🔍 Checking for matches:');
  let matchCount = 0;
  jennyAssignments.forEach(a => {
    const found = apiServices.find(s => s.id === a.serviceId);
    if (found) {
      console.log('   ✅', a.serviceId, 'matches', found.name);
      matchCount++;
    } else {
      console.log('   ❌', a.serviceId, 'NOT FOUND in API services');
    }
  });
  
  console.log('\n📊 Result:', matchCount, 'out of', jennyAssignments.length, 'assignments match API services');
  
  if (matchCount === 0) {
    console.log('\n❌ PROBLEM: Service IDs don\'t match!');
    console.log('   This means assignments were created with wrong service IDs');
    console.log('   Need to re-run setup script with correct IDs');
  }
}

compareServiceIds();
```

---

## Run This Now

**As Jenny or Owner, paste this in console:**

```javascript
async function fullDiagnostic() {
  console.log('='.repeat(60));
  console.log('JENNY BOOKING DIAGNOSTIC');
  console.log('='.repeat(60));
  
  const currentUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
  console.log('\n1️⃣ USER:', currentUser.name, '(' + currentUser.id + ')');
  
  const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
  const jennyAssignments = assignments.filter(a => a.userId === currentUser.id && a.assigned);
  console.log('\n2️⃣ ASSIGNMENTS:', jennyAssignments.length);
  
  const response = await fetch('/api/services', {
    headers: { 'x-user-email': currentUser.email }
  });
  
  if (response.ok) {
    const data = await response.json();
    const services = data.services || [];
    console.log('\n3️⃣ API SERVICES:', services.length);
    
    let matches = 0;
    jennyAssignments.forEach(a => {
      if (services.find(s => s.id === a.serviceId)) matches++;
    });
    
    console.log('\n4️⃣ MATCHES:', matches, 'out of', jennyAssignments.length);
    
    if (matches === 0 && jennyAssignments.length > 0) {
      console.log('\n❌ SERVICE ID MISMATCH!');
      console.log('Assignments have IDs:', jennyAssignments.map(a => a.serviceId));
      console.log('API has IDs:', services.map(s => s.id));
    } else if (jennyAssignments.length === 0) {
      console.log('\n❌ NO ASSIGNMENTS!');
    } else {
      console.log('\n✅ Should work! Refresh the page.');
    }
  } else {
    console.log('\n❌ API ERROR:', response.status);
  }
}

fullDiagnostic();
```

This will tell us EXACTLY what's wrong.

