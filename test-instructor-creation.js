#!/usr/bin/env node

/**
 * Test instructor creation via API
 */

console.log('🧪 TESTING INSTRUCTOR CREATION API');
console.log('==================================\n');

async function testInstructorCreation() {
  try {
    const testData = {
      email: 'test-instructor@example.com',
      name: 'Test Instructor',
      businessName: 'Test Studio',
      licenseNumber: 'TEST123',
      licenseState: 'CA',
      password: 'TestPassword123!',
      role: 'instructor',
      selectedPlan: 'studio'
    };

    console.log('📝 Test data:', JSON.stringify(testData, null, 2));
    
    console.log('\n🚀 Making API request to create instructor...');
    
    const response = await fetch('http://localhost:3000/api/auth/create-instructor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    
    const result = await response.json();
    console.log('📊 Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ INSTRUCTOR CREATION SUCCESSFUL!');
      console.log('✅ Email:', result.email);
      console.log('✅ Database schema issue is fixed');
    } else {
      console.log('\n❌ INSTRUCTOR CREATION FAILED!');
      console.log('❌ Error:', result.error);
      console.log('❌ Details:', result.details);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure the development server is running: npm run dev');
  }
}

// Test the API
testInstructorCreation();
