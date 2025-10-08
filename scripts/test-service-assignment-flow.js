/**
 * Test Service Assignment and Supervision Booking Flow
 * 
 * This script helps verify that:
 * 1. Owner can assign services to students
 * 2. Students can only see their assigned services in supervision booking
 * 
 * Run this to check the data flow and debug issues
 */

console.log('🧪 Service Assignment Flow Test\n')
console.log('='.repeat(60))

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  console.log('❌ This script must be run in the browser console')
  console.log('   1. Open your browser')
  console.log('   2. Navigate to the Service Assignments page')
  console.log('   3. Open the browser console (F12)')
  console.log('   4. Copy and paste this script')
  process.exit(1)
}

// Get current user info
const getCurrentUserFromAuth = () => {
  try {
    // Try to get from localStorage (demo auth)
    const demoUser = localStorage.getItem('demo-user')
    if (demoUser) {
      return JSON.parse(demoUser)
    }
    
    // Try to get from session
    const sessionUser = sessionStorage.getItem('current-user')
    if (sessionUser) {
      return JSON.parse(sessionUser)
    }
    
    return null
  } catch (e) {
    console.error('Error getting current user:', e)
    return null
  }
}

// Test 1: Check if service assignments exist
console.log('\n📋 Test 1: Check Service Assignments')
console.log('-'.repeat(60))

const serviceAssignments = localStorage.getItem('service-assignments')
if (!serviceAssignments) {
  console.log('❌ No service assignments found in localStorage')
  console.log('   Action: Go to Service Assignments page and assign services to team members')
} else {
  const assignments = JSON.parse(serviceAssignments)
  console.log(`✅ Found ${assignments.length} total assignments`)
  
  // Group by user
  const userAssignments = {}
  assignments.forEach(assignment => {
    if (assignment.assigned) {
      if (!userAssignments[assignment.userId]) {
        userAssignments[assignment.userId] = []
      }
      userAssignments[assignment.userId].push(assignment.serviceId)
    }
  })
  
  console.log('\n   Assignments by user:')
  Object.keys(userAssignments).forEach(userId => {
    console.log(`   - User ${userId}: ${userAssignments[userId].length} services assigned`)
  })
  
  // Check for active assignments
  const activeAssignments = assignments.filter(a => a.assigned)
  console.log(`\n   Active assignments: ${activeAssignments.length}`)
  if (activeAssignments.length === 0) {
    console.log('   ⚠️  No active assignments found - toggle some services ON and save')
  }
}

// Test 2: Check current user
console.log('\n👤 Test 2: Check Current User')
console.log('-'.repeat(60))

const currentUser = getCurrentUserFromAuth()
if (!currentUser) {
  console.log('❌ No current user found - please log in')
} else {
  console.log('✅ Current user found:')
  console.log(`   Name: ${currentUser.name}`)
  console.log(`   Email: ${currentUser.email}`)
  console.log(`   User ID: ${currentUser.id}`)
  console.log(`   Role: ${currentUser.role}`)
}

// Test 3: Check if current user has service assignments (if student)
if (currentUser && serviceAssignments) {
  console.log('\n🎯 Test 3: Check User-Specific Service Assignments')
  console.log('-'.repeat(60))
  
  const assignments = JSON.parse(serviceAssignments)
  const userAssignments = assignments.filter(
    a => a.userId === currentUser.id && a.assigned
  )
  
  if (currentUser.role === 'student') {
    if (userAssignments.length === 0) {
      console.log('❌ ISSUE FOUND: Student has NO service assignments!')
      console.log('   This explains why no services show in supervision booking')
      console.log('   Action Required:')
      console.log('   1. Log in as the studio owner/manager')
      console.log('   2. Go to Studio → Service Assignments')
      console.log('   3. Click on this student\'s name')
      console.log('   4. Toggle ON the services they should be able to perform')
      console.log('   5. Click "Save Assignments"')
      console.log(`   6. Student user ID to assign: ${currentUser.id}`)
    } else {
      console.log(`✅ Student has ${userAssignments.length} services assigned`)
      console.log('   Service IDs:', userAssignments.map(a => a.serviceId))
    }
  } else {
    console.log(`ℹ️  User is ${currentUser.role} - will see all services (not filtered)`)
  }
}

// Test 4: Simulate the supervision booking service filter
if (currentUser && serviceAssignments) {
  console.log('\n🔍 Test 4: Simulate Service Filtering Logic')
  console.log('-'.repeat(60))
  
  // This simulates what happens in supervision/page.tsx
  const assignments = JSON.parse(serviceAssignments)
  
  // Mock some services for testing
  const mockServices = [
    { id: 'service-1', name: 'Microblading' },
    { id: 'service-2', name: 'Powder Brows' },
    { id: 'service-3', name: 'Lip Blush' }
  ]
  
  console.log(`   Total services available: ${mockServices.length}`)
  
  if (currentUser.role === 'student') {
    const filteredServices = mockServices.filter(service => {
      return assignments.some(assignment =>
        assignment.serviceId === service.id &&
        assignment.userId === currentUser.id &&
        assignment.assigned === true
      )
    })
    
    console.log(`   Filtered services for student: ${filteredServices.length}`)
    if (filteredServices.length === 0) {
      console.log('   ❌ Student will see NO services in the dropdown!')
    } else {
      console.log('   ✅ Student will see these services:')
      filteredServices.forEach(s => console.log(`      - ${s.name}`))
    }
  } else {
    console.log(`   ✅ ${currentUser.role} will see all services (no filtering)`)
  }
}

// Summary and recommendations
console.log('\n📊 Summary & Recommendations')
console.log('='.repeat(60))

if (!serviceAssignments || JSON.parse(serviceAssignments).filter(a => a.assigned).length === 0) {
  console.log('❌ Critical: No service assignments configured')
  console.log('\n   Next Steps:')
  console.log('   1. Log in as studio owner/manager')
  console.log('   2. Navigate to: /studio/service-assignments')
  console.log('   3. Click on each team member')
  console.log('   4. Toggle ON their allowed services')
  console.log('   5. Click "Save Assignments"')
} else if (currentUser?.role === 'student') {
  const assignments = JSON.parse(serviceAssignments)
  const userAssignments = assignments.filter(
    a => a.userId === currentUser.id && a.assigned
  )
  
  if (userAssignments.length === 0) {
    console.log('❌ Critical: This student has no service assignments')
    console.log('\n   Fix:')
    console.log(`   - Assign services to user ID: ${currentUser.id}`)
    console.log(`   - Student name: ${currentUser.name}`)
  } else {
    console.log('✅ Everything looks good!')
    console.log(`   - Student has ${userAssignments.length} services assigned`)
    console.log('   - These services should appear in supervision booking')
  }
} else {
  console.log('✅ Configuration looks good!')
  console.log('   - Service assignments are set up')
  console.log('   - Non-student users will see all services')
}

console.log('\n' + '='.repeat(60))
console.log('Test complete! Check the output above for any issues.\n')

