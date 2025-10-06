#!/usr/bin/env node

/**
 * Check if student tierra@universalbeautystudio.com exists and create if needed
 */

console.log('🔍 CHECKING STUDENT EXISTENCE: tierra@universalbeautystudio.com')
console.log('================================================================')

async function checkAndCreateStudent() {
  const studentEmail = 'tierra@universalbeautystudio.com'
  
  try {
    // First, check if user exists
    console.log('\n🔍 Step 1: Checking if student exists in database...')
    
    const checkResponse = await fetch('https://thepmuguide.com/api/test-db-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `SELECT id, name, email, role, "studioName", "selectedPlan" FROM "User" WHERE email = '${studentEmail}'`
      })
    })
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json()
      console.log('✅ Database connection successful')
      console.log('📋 Student query result:', checkData.result)
      
      if (checkData.result && checkData.result.length > 0) {
        const student = checkData.result[0]
        console.log('✅ STUDENT EXISTS:')
        console.log(`   ID: ${student.id}`)
        console.log(`   Name: ${student.name}`)
        console.log(`   Email: ${student.email}`)
        console.log(`   Role: ${student.role}`)
        console.log(`   Studio: ${student.studioName}`)
        console.log(`   Plan: ${student.selectedPlan}`)
        
        // Check if they have proper studio access
        if (!student.studioName) {
          console.log('❌ ISSUE: Student has no studioName!')
          console.log('🔧 This is why they can\'t access instructors')
          
          // Update student with studio info
          console.log('\n🔧 Fixing student studio access...')
          const updateResponse = await fetch('https://thepmuguide.com/api/test-db-connection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query: `UPDATE "User" SET "studioName" = 'Universal Beauty Studio', "selectedPlan" = 'studio' WHERE email = '${studentEmail}' RETURNING *`
            })
          })
          
          if (updateResponse.ok) {
            const updateData = await updateResponse.json()
            console.log('✅ Student updated with studio access:', updateData.result[0])
          }
        } else {
          console.log('✅ Student has proper studio access')
        }
        
      } else {
        console.log('❌ STUDENT DOES NOT EXIST!')
        console.log('🔧 Creating student...')
        
        // Create the student
        const createResponse = await fetch('https://thepmuguide.com/api/test-db-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `INSERT INTO "User" (id, name, email, role, "studioName", "selectedPlan", "hasActiveSubscription", "isLicenseVerified", "createdAt", "updatedAt") VALUES ('student-tierra-${Date.now()}', 'Tierra Student', '${studentEmail}', 'student', 'Universal Beauty Studio', 'studio', true, false, NOW(), NOW()) RETURNING *`
          })
        })
        
        if (createResponse.ok) {
          const createData = await createResponse.json()
          console.log('✅ Student created successfully:', createData.result[0])
        } else {
          console.log('❌ Failed to create student')
        }
      }
      
    } else {
      console.log('❌ Database connection failed')
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

async function testStudentAccessAfterFix() {
  console.log('\n🧪 Step 2: Testing student access after fix...')
  
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
      console.log('✅ API Access Fixed!')
      console.log(`Success: ${data.success}`)
      console.log(`Studio: ${data.studioName}`)
      console.log(`Instructors: ${data.instructors?.length || 0}`)
      
      if (data.instructors && data.instructors.length > 0) {
        console.log('\n📋 Instructors from API:')
        data.instructors.forEach((instructor, index) => {
          console.log(`${index + 1}. ${instructor.name} (${instructor.role})`)
        })
      }
    } else {
      const errorData = await response.text()
      console.log('❌ API still failing:', errorData)
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

async function runFullTest() {
  await checkAndCreateStudent()
  await testStudentAccessAfterFix()
  
  console.log('\n🎯 SUMMARY:')
  console.log('============')
  console.log('✅ Student should now exist in database')
  console.log('✅ Student should have proper studio access')
  console.log('✅ API should return instructors for student')
  console.log('✅ Supervision page should show instructors')
  console.log('\n🚀 Next: Test student login on supervision page')
}

runFullTest().catch(console.error)
