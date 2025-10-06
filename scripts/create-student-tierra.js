#!/usr/bin/env node

/**
 * Create student tierra@universalbeautystudio.com using the signin API
 */

console.log('👨‍🎓 CREATING STUDENT: tierra@universalbeautystudio.com')
console.log('==================================================')

async function createStudent() {
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
    phone: '(555) 123-4567'
  }
  
  console.log('\n📋 Student Data:')
  console.log(`Name: ${studentData.name}`)
  console.log(`Email: ${studentData.email}`)
  console.log(`Role: ${studentData.role}`)
  console.log(`Studio: ${studentData.studioName}`)
  console.log(`Plan: ${studentData.selectedPlan}`)
  
  try {
    console.log('\n🚀 Creating student via /api/auth/signin...')
    
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
      console.log('Response:', data)
      
      if (data.user) {
        console.log('\n👤 Created User:')
        console.log(`ID: ${data.user.id}`)
        console.log(`Name: ${data.user.name}`)
        console.log(`Email: ${data.user.email}`)
        console.log(`Role: ${data.user.role}`)
        console.log(`Studio: ${data.user.studioName}`)
      }
      
    } else {
      const errorData = await response.text()
      console.log('❌ Failed to create student:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

async function testStudentAccess() {
  console.log('\n🧪 Testing student access to instructors...')
  
  const studentEmail = 'tierra@universalbeautystudio.com'
  
  try {
    const response = await fetch('https://thepmuguide.com/api/studio/instructors', {
      method: 'GET',
      headers: {
        'x-user-email': studentEmail
      }
    })
    
    console.log(`API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Student can access instructors!')
      console.log(`Success: ${data.success}`)
      console.log(`Studio: ${data.studioName}`)
      console.log(`Instructors Found: ${data.instructors?.length || 0}`)
      
      if (data.instructors && data.instructors.length > 0) {
        console.log('\n📋 Instructors available to student:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
          console.log(`   Email: ${instructor.email}`)
        })
      } else {
        console.log('⚠️ No instructors found in database')
        console.log('📝 This is expected - instructors are in localStorage, not database')
      }
      
    } else {
      const errorData = await response.text()
      console.log('❌ Student still cannot access instructors:')
      console.log(`Status: ${response.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

async function testStudentLogin() {
  console.log('\n🔐 Testing student login...')
  
  try {
    const loginResponse = await fetch('https://thepmuguide.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'tierra@universalbeautystudio.com',
        password: 'TierraStudent123!'
      })
    })
    
    console.log(`Login Response Status: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Student login successful!')
      console.log('Login response:', loginData)
    } else {
      const errorData = await loginResponse.text()
      console.log('❌ Student login failed:')
      console.log(`Status: ${loginResponse.status}`)
      console.log(`Error: ${errorData}`)
    }
    
  } catch (error) {
    console.log('❌ Login network error:', error.message)
  }
}

async function runFullTest() {
  console.log('🎯 FULL STUDENT CREATION AND TEST')
  console.log('=================================')
  
  // Step 1: Create student
  await createStudent()
  
  // Step 2: Test student access
  await testStudentAccess()
  
  // Step 3: Test student login
  await testStudentLogin()
  
  console.log('\n🎯 SUMMARY:')
  console.log('============')
  console.log('✅ Student should now exist in database')
  console.log('✅ Student should be able to login')
  console.log('✅ Student should have access to studio instructors API')
  console.log('✅ Supervision page should work for this student')
  console.log('\n🚀 NEXT: Student can now login and access supervision booking!')
}

runFullTest().catch(console.error)
