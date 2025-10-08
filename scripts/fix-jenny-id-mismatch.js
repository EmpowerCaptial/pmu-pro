/**
 * Fix Jenny's Service Assignment ID Mismatch
 * 
 * This script identifies and fixes the common issue where:
 * 1. Jenny is added to team members (localStorage) with one ID
 * 2. Service assignments use that localStorage ID
 * 3. But Jenny logs in with a different database user ID
 * 4. Result: Services don't show because IDs don't match
 * 
 * Run this in browser console TWICE:
 * 1. Once while logged in as Jenny (to get her login ID)
 * 2. Once while logged in as Owner (to fix the assignments)
 */

console.log('🔧 JENNY SERVICE ASSIGNMENT ID FIX\n')
console.log('='.repeat(70))

// Get current user
function getCurrentUser() {
  try {
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser) return JSON.parse(demoUser)
    
    const sessionUser = sessionStorage.getItem('current-user')
    if (sessionUser) return JSON.parse(sessionUser)
    
    return null
  } catch (e) {
    return null
  }
}

const currentUser = getCurrentUser()

if (!currentUser) {
  console.log('❌ No user logged in')
  console.log('   Please log in and run this script again')
} else {
  console.log('✅ Current user:', currentUser.name)
  console.log('   Email:', currentUser.email)
  console.log('   User ID:', currentUser.id)
  console.log('   Role:', currentUser.role)
}

// Step 1: If this is Jenny, record her ID
if (currentUser && (currentUser.name?.toLowerCase().includes('jenny') || currentUser.role === 'student')) {
  console.log('\n📝 STEP 1: Recording Jenny\'s Login ID')
  console.log('-'.repeat(70))
  
  const jennyInfo = {
    loginId: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    recordedAt: new Date().toISOString()
  }
  
  localStorage.setItem('jenny-login-id', JSON.stringify(jennyInfo))
  console.log('✅ Recorded Jenny\'s login ID:', jennyInfo.loginId)
  console.log('\n   Next steps:')
  console.log('   1. Log out')
  console.log('   2. Log in as the studio owner')
  console.log('   3. Run this script again to fix the assignments')
}

// Step 2: If this is the owner, fix the assignments
if (currentUser && ['owner', 'manager', 'director'].includes(currentUser.role)) {
  console.log('\n🔧 STEP 2: Fixing Service Assignments')
  console.log('-'.repeat(70))
  
  // Get Jenny's login ID
  const jennyInfoStr = localStorage.getItem('jenny-login-id')
  if (!jennyInfoStr) {
    console.log('⚠️  Jenny\'s login ID not recorded yet')
    console.log('   Please:')
    console.log('   1. Log in as Jenny')
    console.log('   2. Run this script (it will record her ID)')
    console.log('   3. Then log back in as owner and run again')
  } else {
    const jennyInfo = JSON.parse(jennyInfoStr)
    console.log('✅ Found Jenny\'s login ID:', jennyInfo.loginId)
    console.log('   Name:', jennyInfo.name)
    console.log('   Recorded:', new Date(jennyInfo.recordedAt).toLocaleString())
    
    // Check team members
    const teamMembersStr = localStorage.getItem('studio-team-members')
    if (!teamMembersStr) {
      console.log('❌ No team members found')
    } else {
      const teamMembers = JSON.parse(teamMembersStr)
      const jennyInTeam = teamMembers.find(m => 
        m.name?.toLowerCase().includes('jenny') || 
        m.email === jennyInfo.email
      )
      
      if (jennyInTeam) {
        console.log('\n   Jenny in team members:')
        console.log('   Team Member ID:', jennyInTeam.id)
        console.log('   Login ID:', jennyInfo.loginId)
        
        if (jennyInTeam.id !== jennyInfo.loginId) {
          console.log('\n   ❌ ID MISMATCH DETECTED!')
          console.log('   This is the problem!')
          
          // Update Jenny's team member ID to match her login ID
          const updatedTeamMembers = teamMembers.map(m => {
            if (m.id === jennyInTeam.id) {
              return { ...m, id: jennyInfo.loginId }
            }
            return m
          })
          
          localStorage.setItem('studio-team-members', JSON.stringify(updatedTeamMembers))
          console.log('   ✅ Updated team member ID to match login ID')
          
          // Fix service assignments
          const assignmentsStr = localStorage.getItem('service-assignments')
          if (assignmentsStr) {
            const assignments = JSON.parse(assignmentsStr)
            const updatedAssignments = assignments.map(a => {
              if (a.userId === jennyInTeam.id) {
                return { ...a, userId: jennyInfo.loginId }
              }
              return a
            })
            
            localStorage.setItem('service-assignments', JSON.stringify(updatedAssignments))
            console.log('   ✅ Updated service assignment IDs')
            
            const jennyAssignments = updatedAssignments.filter(
              a => a.userId === jennyInfo.loginId && a.assigned
            )
            console.log(`   ✅ Jenny now has ${jennyAssignments.length} services assigned`)
          }
          
          console.log('\n   🎉 FIX COMPLETE!')
          console.log('   Have Jenny log in and try booking supervision again')
        } else {
          console.log('\n   ✅ IDs match - no fix needed!')
        }
      } else {
        console.log('\n   ❌ Jenny not found in team members')
        console.log('   Please add Jenny to the team first')
      }
    }
  }
}

// Summary
console.log('\n📊 SUMMARY')
console.log('='.repeat(70))

if (currentUser?.role === 'student') {
  console.log('✅ Student ID recorded')
  console.log('   Next: Log in as owner and run this script again')
} else if (currentUser && ['owner', 'manager', 'director'].includes(currentUser.role)) {
  const jennyInfoStr = localStorage.getItem('jenny-login-id')
  if (jennyInfoStr) {
    console.log('✅ ID mismatch fixed (if any)')
    console.log('   Jenny should now see her assigned services')
  } else {
    console.log('⚠️  Need Jenny to log in first and run this script')
  }
} else {
  console.log('Please log in and run this script')
}

console.log('\n' + '='.repeat(70))

