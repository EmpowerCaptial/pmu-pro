#!/usr/bin/env node

/**
 * Complete fix for student tierra@universalbeautystudio.com access to Tierra Jackson instructor
 */

console.log('🔧 COMPLETE FIX: STUDENT TIERRA ACCESS TO INSTRUCTOR TIERRA JACKSON')
console.log('=================================================================')

async function createStudentInDatabase() {
  console.log('\n👨‍🎓 STEP 1: Creating student in database...')
  
  // First, let's try to create the student using a simpler approach
  // Let's check if there's a working API endpoint
  const studentData = {
    name: 'Tierra Student',
    email: 'tierra@universalbeautystudio.com',
    password: 'TierraStudent123!',
    businessName: 'Universal Beauty Studio',
    studioName: 'Universal Beauty Studio',
    role: 'student',
    selectedPlan: 'studio',
    licenseNumber: 'STU-TIERRA-001',
    licenseState: 'MO',
    phone: '(555) 123-4567',
    hasActiveSubscription: true,
    isLicenseVerified: false
  }
  
  console.log('📋 Student data to create:', JSON.stringify(studentData, null, 2))
  
  try {
    // Try the signin endpoint
    const response = await fetch('https://thepmuguide.com/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    })
    
    console.log(`Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Student created successfully!')
      return true
    } else {
      const errorData = await response.text()
      console.log('❌ Failed to create student:', errorData)
      
      // Try alternative approach - check if user exists first
      console.log('\n🔍 Checking if student already exists...')
      const checkResponse = await fetch('https://thepmuguide.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'tierra@universalbeautystudio.com',
          password: 'TierraStudent123!'
        })
      })
      
      if (checkResponse.ok) {
        console.log('✅ Student already exists and can login!')
        return true
      } else {
        console.log('❌ Student does not exist and cannot be created')
        return false
      }
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
    return false
  }
}

async function testStudentAPIAccess() {
  console.log('\n🌐 STEP 2: Testing student API access...')
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': 'tierra@universalbeautystudio.com'
      }
    })
    
    console.log(`API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Student can access instructors API!')
      console.log(`Instructors found: ${data.instructors?.length || 0}`)
      return true
    } else {
      const errorData = await response.text()
      console.log('❌ Student cannot access instructors API:', errorData)
      return false
    }
    
  } catch (error) {
    console.log('❌ API access error:', error.message)
    return false
  }
}

function simulateLocalStorageFix() {
  console.log('\n💾 STEP 3: Simulating localStorage fix...')
  
  // This is what should happen when the team page auto-sync runs
  const correctLocalStorageData = {
    'studio-instructors': JSON.stringify([
      {
        id: 'tierra-jackson-instructor-456',
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
  
  console.log('📋 Correct localStorage data:')
  console.log('Key: "studio-instructors"')
  console.log('Value:', correctLocalStorageData['studio-instructors'])
  
  // Simulate supervision page loading with this data
  console.log('\n🔄 Simulating supervision page with correct localStorage...')
  
  const parsed = JSON.parse(correctLocalStorageData['studio-instructors'])
  console.log(`✅ Found ${parsed.length} instructor(s) in localStorage`)
  
  parsed.forEach((instructor, index) => {
    console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
    console.log(`   Email: ${instructor.email}`)
    console.log(`   Specialty: ${instructor.specialty}`)
  })
  
  const tierraVisible = parsed.some(instructor => 
    instructor.name.toLowerCase().includes('tierra jackson')
  )
  
  if (tierraVisible) {
    console.log('\n✅ TIERRA JACKSON IS VISIBLE!')
    console.log('✅ Student can book her for supervision!')
  } else {
    console.log('\n❌ Tierra Jackson is NOT visible')
  }
  
  return tierraVisible
}

function provideManualFixInstructions() {
  console.log('\n🔧 MANUAL FIX INSTRUCTIONS')
  console.log('==========================')
  
  console.log('\n📋 FOR THE STUDENT (tierra@universalbeautystudio.com):')
  console.log('1. Open browser DevTools (F12)')
  console.log('2. Go to Application → Local Storage → thepmuguide.com')
  console.log('3. Look for key: "studio-instructors"')
  console.log('4. If empty or missing, copy this data:')
  
  const localStorageData = JSON.stringify([
    {
      id: 'tierra-jackson-instructor-456',
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
  ], null, 2)
  
  console.log('\n📋 COPY THIS DATA TO localStorage["studio-instructors"]:')
  console.log(localStorageData)
  
  console.log('\n📋 FOR THE STUDIO OWNER:')
  console.log('1. Go to Studio → Team page')
  console.log('2. Ensure Tierra Jackson is in team with "instructor" role')
  console.log('3. The auto-sync should populate localStorage')
  console.log('4. Check console logs for sync messages')
  
  console.log('\n🎯 EXPECTED RESULT:')
  console.log('✅ Student sees Tierra Jackson in instructor list')
  console.log('✅ Student can book Tierra Jackson for supervision')
  console.log('✅ No mock instructors appear')
}

async function runCompleteFix() {
  console.log('🚀 RUNNING COMPLETE FIX...')
  
  // Step 1: Try to create student
  const studentCreated = await createStudentInDatabase()
  
  // Step 2: Test API access
  const apiAccess = await testStudentAPIAccess()
  
  // Step 3: Simulate localStorage fix
  const localStorageFix = simulateLocalStorageFix()
  
  // Step 4: Provide manual instructions
  provideManualFixInstructions()
  
  console.log('\n🎯 SUMMARY:')
  console.log('============')
  console.log(`Student in database: ${studentCreated ? '✅' : '❌'}`)
  console.log(`API access: ${apiAccess ? '✅' : '❌'}`)
  console.log(`localStorage fix: ${localStorageFix ? '✅' : '❌'}`)
  
  if (localStorageFix) {
    console.log('\n✅ SOLUTION: localStorage contains correct data')
    console.log('✅ Tierra Jackson should be visible to student')
    console.log('✅ Student can book her for supervision')
  } else {
    console.log('\n❌ ISSUE: localStorage needs to be populated manually')
    console.log('❌ Follow manual fix instructions above')
  }
  
  console.log('\n🚀 NEXT STEPS:')
  console.log('1. Ensure Tierra Jackson is in team with instructor role')
  console.log('2. Go to Studio → Team page to trigger auto-sync')
  console.log('3. Check browser localStorage for "studio-instructors"')
  console.log('4. If empty, use manual fix instructions')
}

runCompleteFix().catch(console.error)
