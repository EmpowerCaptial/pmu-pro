/**
 * Debug Jenny's Service Assignment Issue
 * 
 * Run this in the browser console to diagnose why assignments aren't showing
 */

console.log('🔍 DEBUGGING JENNY\'S SERVICE ASSIGNMENTS\n')
console.log('='.repeat(70))

// Helper to get current user
function getCurrentUser() {
  try {
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser) return JSON.parse(demoUser)
    
    const sessionUser = sessionStorage.getItem('current-user')
    if (sessionUser) return JSON.parse(sessionUser)
    
    return null
  } catch (e) {
    console.error('Error getting user:', e)
    return null
  }
}

// Get current user
const currentUser = getCurrentUser()
console.log('\n📋 STEP 1: Current User Info')
console.log('-'.repeat(70))
if (!currentUser) {
  console.log('❌ NO USER LOGGED IN!')
  console.log('   Please log in as Jenny and run this script again')
} else {
  console.log('✅ User found:')
  console.log(`   Name: ${currentUser.name}`)
  console.log(`   Email: ${currentUser.email}`)
  console.log(`   User ID: "${currentUser.id}"`)
  console.log(`   Role: ${currentUser.role}`)
  console.log(`   ID Type: ${typeof currentUser.id}`)
  console.log(`   ID Length: ${currentUser.id?.length || 0}`)
}

// Get service assignments
console.log('\n📋 STEP 2: Service Assignments in localStorage')
console.log('-'.repeat(70))
const assignmentsStr = localStorage.getItem('service-assignments')
if (!assignmentsStr) {
  console.log('❌ NO ASSIGNMENTS FOUND in localStorage!')
  console.log('   Key: "service-assignments" does not exist')
} else {
  console.log('✅ Assignments found in localStorage')
  const assignments = JSON.parse(assignmentsStr)
  console.log(`   Total assignments: ${assignments.length}`)
  console.log(`   Active (assigned=true): ${assignments.filter(a => a.assigned).length}`)
  
  // Show all unique user IDs
  const uniqueUserIds = [...new Set(assignments.map(a => a.userId))]
  console.log(`\n   Unique User IDs in assignments: ${uniqueUserIds.length}`)
  uniqueUserIds.forEach((userId, index) => {
    const userAssignments = assignments.filter(a => a.userId === userId)
    const activeCount = userAssignments.filter(a => a.assigned).length
    console.log(`   ${index + 1}. "${userId}" (${typeof userId}) - ${activeCount} active assignments`)
  })
}

// Check for Jenny specifically
if (currentUser && assignmentsStr) {
  console.log('\n📋 STEP 3: Jenny\'s Specific Assignments')
  console.log('-'.repeat(70))
  
  const assignments = JSON.parse(assignmentsStr)
  
  // Look for exact match
  const exactMatches = assignments.filter(a => a.userId === currentUser.id)
  console.log(`\n   Exact matches (userId === "${currentUser.id}"):`)
  console.log(`   Found: ${exactMatches.length} assignments`)
  if (exactMatches.length > 0) {
    console.log(`   Active: ${exactMatches.filter(a => a.assigned).length}`)
    exactMatches.forEach((a, i) => {
      console.log(`   ${i + 1}. Service: ${a.serviceId}, Assigned: ${a.assigned}`)
    })
  }
  
  // Look for similar matches (case-insensitive, trimmed)
  const similarMatches = assignments.filter(a => 
    a.userId?.toLowerCase().trim() === currentUser.id?.toLowerCase().trim()
  )
  console.log(`\n   Similar matches (case-insensitive, trimmed):`)
  console.log(`   Found: ${similarMatches.length} assignments`)
  
  // Look for name-based matches (if Jenny is in the name)
  if (currentUser.name?.toLowerCase().includes('jenny')) {
    console.log(`\n   🔍 Current user is Jenny - checking team members data...`)
    
    const teamMembersStr = localStorage.getItem('studio-team-members')
    if (teamMembersStr) {
      const teamMembers = JSON.parse(teamMembersStr)
      const jennyMembers = teamMembers.filter(m => 
        m.name?.toLowerCase().includes('jenny')
      )
      console.log(`   Found ${jennyMembers.length} team member(s) with "jenny" in name:`)
      jennyMembers.forEach((m, i) => {
        console.log(`   ${i + 1}. Name: ${m.name}, ID: "${m.id}", Email: ${m.email}`)
      })
    }
  }
}

// Check team members
console.log('\n📋 STEP 4: Team Members in localStorage')
console.log('-'.repeat(70))
const teamMembersStr = localStorage.getItem('studio-team-members')
if (!teamMembersStr) {
  console.log('❌ NO TEAM MEMBERS FOUND')
} else {
  const teamMembers = JSON.parse(teamMembersStr)
  console.log(`✅ Found ${teamMembers.length} team members`)
  teamMembers.forEach((member, i) => {
    console.log(`   ${i + 1}. ${member.name} - ID: "${member.id}" - Email: ${member.email} - Role: ${member.role}`)
  })
}

// Diagnosis
console.log('\n📋 STEP 5: DIAGNOSIS')
console.log('='.repeat(70))

if (!currentUser) {
  console.log('❌ ISSUE: No user logged in')
  console.log('   FIX: Log in as Jenny')
} else if (!assignmentsStr) {
  console.log('❌ ISSUE: No service assignments saved')
  console.log('   FIX: Owner needs to assign services and click "Save Assignments"')
} else {
  const assignments = JSON.parse(assignmentsStr)
  const userAssignments = assignments.filter(a => 
    a.userId === currentUser.id && a.assigned
  )
  
  if (userAssignments.length === 0) {
    console.log('❌ ISSUE FOUND: User ID mismatch!')
    console.log(`   Current user ID: "${currentUser.id}"`)
    console.log(`   User IDs in assignments:`)
    
    const uniqueUserIds = [...new Set(assignments.map(a => a.userId))]
    uniqueUserIds.forEach(id => {
      console.log(`      - "${id}" ${id === currentUser.id ? '✅ MATCH' : '❌ NO MATCH'}`)
    })
    
    console.log('\n   🔧 POSSIBLE FIXES:')
    console.log('   1. User ID in assignments doesn\'t match logged-in user')
    console.log('   2. Owner may have assigned to wrong team member')
    console.log('   3. User account might have changed/recreated')
    
    console.log('\n   💡 RECOMMENDED ACTION:')
    console.log('   1. Copy this user ID: ' + currentUser.id)
    console.log('   2. Log in as owner/manager')
    console.log('   3. Go to Service Assignments')
    console.log('   4. Verify Jenny\'s user ID matches')
    console.log('   5. Re-assign services and save')
  } else {
    console.log('✅ Everything looks good!')
    console.log(`   User has ${userAssignments.length} services assigned`)
    console.log('   Services:', userAssignments.map(a => a.serviceId))
  }
}

console.log('\n' + '='.repeat(70))
console.log('Debug complete! Copy the output above and share if issue persists.\n')

// Export data for further analysis
console.log('📊 EXPORTABLE DATA:')
console.log(JSON.stringify({
  currentUser: currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role
  } : null,
  assignments: assignmentsStr ? JSON.parse(assignmentsStr).length : 0,
  assignedToCurrentUser: currentUser && assignmentsStr ? 
    JSON.parse(assignmentsStr).filter(a => a.userId === currentUser.id && a.assigned).length : 0
}, null, 2))

