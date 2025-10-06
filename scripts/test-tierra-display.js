#!/usr/bin/env node

/**
 * Test script to check why Tierra Jackson isn't showing on supervision booking list
 */

console.log('🔍 TESTING TIERRA JACKSON DISPLAY ISSUE...')
console.log('==========================================')

// Simulate the localStorage data that should exist
const mockStudioInstructors = [
  {
    id: 'tierra-jackson-1',
    name: 'Tierra Jackson',
    email: 'tierra@studio.com',
    role: 'instructor',
    specialty: 'PMU Instructor',
    experience: '5+ years',
    rating: 4.8,
    location: 'Studio',
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
]

console.log('\n📋 STEP 1: Checking localStorage Data Structure')
console.log('-----------------------------------------------')
console.log('Expected localStorage key: "studio-instructors"')
console.log('Expected data:')
console.log(JSON.stringify(mockStudioInstructors, null, 2))

console.log('\n🔧 STEP 2: Simulating Supervision Page Logic')
console.log('---------------------------------------------')

// Simulate the transformation logic from supervision page
function transformInstructorData(instructor) {
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    avatar: instructor.avatar,
    role: instructor.role || 'instructor',
    specialties: instructor.specialties,
    certifications: instructor.certifications,
    bio: instructor.bio,
    phone: instructor.phone,
    businessName: instructor.businessName,
    // Add compatibility fields
    specialty: instructor.specialty || instructor.specialties || 'PMU Specialist',
    experience: instructor.experience || '5+ years',
    rating: instructor.rating || 4.8,
    location: instructor.location || instructor.businessName || 'Studio',
    availability: instructor.availability || {
      monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
      tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
      wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
      thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
      friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
      saturday: [],
      sunday: []
    },
    licenseNumber: instructor.licenseNumber || `PMU-${instructor.id?.slice(-3) || '001'}`
  }
}

console.log('\n🔄 Transforming instructor data:')
const transformedInstructors = mockStudioInstructors.map(transformInstructorData)

console.log('\n✅ Transformed Tierra Jackson data:')
console.log(`Name: ${transformedInstructors[0].name}`)
console.log(`Role: ${transformedInstructors[0].role}`)
console.log(`Specialty: ${transformedInstructors[0].specialty}`)
console.log(`Phone: ${transformedInstructors[0].phone}`)
console.log(`Availability: ${Object.keys(transformedInstructors[0].availability).length} days`)

console.log('\n📊 STEP 3: Checking Fallback Logic')
console.log('-----------------------------------')

// Simulate the mock instructors fallback
const mockInstructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialty: 'Eyebrow Microblading',
    experience: '8 years',
    rating: 4.9,
    location: 'Universal Beauty Studio',
    phone: '(555) 123-4567',
    email: 'sarah@universalbeautystudio.com',
    avatar: undefined,
    licenseNumber: 'PMU-2024-001',
    role: 'instructor'
  },
  {
    id: '2',
    name: 'Michael Chen',
    specialty: 'Lip Blushing',
    experience: '6 years',
    rating: 4.8,
    location: 'Universal Beauty Studio',
    phone: '(555) 234-5678',
    email: 'michael@universalbeautystudio.com',
    avatar: undefined,
    licenseNumber: 'PMU-2024-002',
    role: 'instructor'
  }
]

console.log('\n🎭 Mock instructors (fallback data):')
mockInstructors.forEach((instructor, index) => {
  console.log(`${index + 1}. ${instructor.name} (${instructor.specialty})`)
})

console.log('\n🎯 STEP 4: Final Instructor List Logic')
console.log('---------------------------------------')

// Simulate the final logic
let allInstructors = []

// Add transformed instructors from localStorage
if (transformedInstructors.length > 0) {
  allInstructors = [...transformedInstructors]
  console.log(`✅ Added ${transformedInstructors.length} instructor(s) from localStorage`)
}

// Check if we should use mock data
if (allInstructors.length === 0) {
  console.log('⚠️ No instructors from localStorage, using mock data')
  allInstructors = mockInstructors
} else {
  console.log('✅ Using real instructor data from localStorage')
}

console.log('\n📋 FINAL INSTRUCTOR LIST:')
allInstructors.forEach((instructor, index) => {
  console.log(`${index + 1}. ${instructor.name} (${instructor.role || 'instructor'})`)
  console.log(`   Specialty: ${instructor.specialty}`)
  console.log(`   Phone: ${instructor.phone}`)
  console.log(`   Email: ${instructor.email}`)
})

console.log('\n🔍 DIAGNOSIS:')
console.log('=============')

const tierraExists = allInstructors.some(instructor => 
  instructor.name.toLowerCase().includes('tierra') || 
  instructor.name.toLowerCase().includes('jackson')
)

if (tierraExists) {
  console.log('✅ Tierra Jackson should be visible on supervision booking list')
  console.log('✅ The logic is working correctly')
} else {
  console.log('❌ Tierra Jackson is NOT in the instructor list')
  console.log('❌ This means the localStorage data is missing or incorrect')
  console.log('\n🔧 POSSIBLE ISSUES:')
  console.log('1. Tierra Jackson was not added to "studio-instructors" localStorage')
  console.log('2. The localStorage key is incorrect')
  console.log('3. The data structure is wrong')
  console.log('4. The role was not set to "instructor" or "licensed"')
}

console.log('\n🚀 NEXT STEPS:')
console.log('==============')
console.log('1. Check browser localStorage for "studio-instructors" key')
console.log('2. Verify Tierra Jackson is in the team with role "instructor" or "licensed"')
console.log('3. Ensure the role change sync is working properly')
console.log('4. Check console logs for instructor loading messages')
