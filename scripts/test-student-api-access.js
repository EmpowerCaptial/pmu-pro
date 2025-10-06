#!/usr/bin/env node

/**
 * Test the actual API access for student tierra@universalbeautystudio.com
 */

console.log('🧪 TESTING STUDENT API ACCESS')
console.log('=============================')

// Simulate the actual API call that would happen
async function testStudentAPIAccess() {
  console.log('\n🌐 Testing /api/studio/instructors endpoint...')
  
  const studentEmail = 'tierra@universalbeautystudio.com'
  console.log(`Student Email: ${studentEmail}`)
  
  try {
    // Simulate the API request
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': studentEmail
      }
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Response:')
      console.log(`Success: ${data.success}`)
      console.log(`Studio Name: ${data.studioName}`)
      console.log(`Instructors Found: ${data.instructors?.length || 0}`)
      
      if (data.instructors && data.instructors.length > 0) {
        console.log('\n📋 Instructors from API:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
          console.log(`   Email: ${instructor.email}`)
        })
      } else {
        console.log('⚠️ No instructors found in database')
      }
    } else {
      const errorData = await response.text()
      console.log('❌ API Error:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Network Error:')
    console.log(error.message)
  }
}

// Test localStorage simulation
function testLocalStorageAccess() {
  console.log('\n💾 Testing localStorage Access...')
  
  // This would be what's actually in the browser
  const mockLocalStorage = {
    'studio-instructors': JSON.stringify([
      {
        id: 'tierra-jackson-123',
        name: 'Tierra Jackson',
        email: 'tierra.jackson@universalbeautystudio.com',
        role: 'instructor',
        specialty: 'PMU Instructor',
        experience: '5+ years',
        rating: 4.8,
        location: 'Universal Beauty Studio',
        phone: '(555) 123-4567',
        avatar: null,
        licenseNumber: 'LIC-001',
        availability: {
          monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          saturday: [],
          sunday: []
        }
      }
    ])
  }
  
  console.log('📋 localStorage "studio-instructors":')
  const instructors = JSON.parse(mockLocalStorage['studio-instructors'])
  instructors.forEach((instructor, index) => {
    console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
  })
  
  return instructors
}

// Run tests
async function runTests() {
  console.log('🔍 DIAGNOSING STUDENT ACCESS ISSUE...')
  
  // Test localStorage
  const localStorageInstructors = testLocalStorageAccess()
  
  // Test API access
  await testStudentAPIAccess()
  
  console.log('\n🎯 DIAGNOSIS:')
  console.log('=============')
  
  console.log('\n📋 POSSIBLE ISSUES:')
  console.log('1. Tierra Jackson may not be in the database (only in localStorage)')
  console.log('2. Student may not have proper studioName in database')
  console.log('3. localStorage may be empty or not shared between users')
  console.log('4. API endpoint may be failing for students')
  
  console.log('\n🔧 EXPECTED FLOW:')
  console.log('1. Student logs in → supervision page loads')
  console.log('2. Page checks localStorage for "studio-instructors"')
  console.log('3. Page calls API for additional instructors')
  console.log('4. Combines both sources and displays to student')
  
  console.log('\n❌ LIKELY PROBLEM:')
  console.log('Tierra Jackson is in localStorage but NOT in the database.')
  console.log('The supervision page should show her from localStorage, but if localStorage is empty, it falls back to API.')
  console.log('If API is empty too, it shows mock instructors.')
  
  console.log('\n🚀 SOLUTION NEEDED:')
  console.log('1. Ensure Tierra Jackson is properly synced to localStorage')
  console.log('2. Make sure localStorage persists between page loads')
  console.log('3. Add Tierra Jackson to database with instructor role')
  console.log('4. Check if student has proper studio access in database')
}

runTests().catch(console.error)
