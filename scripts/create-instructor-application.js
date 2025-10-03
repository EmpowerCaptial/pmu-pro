#!/usr/bin/env node

/**
 * Create a proper application for the instructor user
 * This will allow them to be approved through the staff-admin application review process
 */

const { ArtistApplicationService } = require('../lib/artist-application-service.ts')

async function createInstructorApplication() {
  console.log('📝 Creating instructor application...')
  
  try {
    // Create a sample application for the instructor user
    const application = {
      id: 'instructor-app-' + Date.now(),
      artistName: 'Universal Beauty Studio Admin',
      email: 'admin@universalbeautystudio.com',
      phone: '(555) 123-4567',
      businessName: 'Universal Beauty Studio',
      businessAddress: '123 Beauty Lane, Los Angeles, CA 90210',
      licenseNumber: 'UBS001',
      experience: '5+ years',
      specialties: ['Microblading', 'Powder Brows', 'Lip Blushing', 'Eyeliner'],
      submittedAt: new Date(),
      status: 'pending',
      documents: [
        {
          id: 'doc-1',
          type: 'license',
          name: 'PMU License.pdf',
          size: 1024000,
          uploadedAt: new Date()
        },
        {
          id: 'doc-2',
          type: 'insurance',
          name: 'Insurance Certificate.pdf',
          size: 512000,
          uploadedAt: new Date()
        }
      ],
      responses: [],
      lastUpdated: new Date()
    }

    // Add the application using the ArtistApplicationService
    const existingApplications = ArtistApplicationService.getAllApplications()
    
    // Check if application already exists
    const existingApp = existingApplications.find(app => app.email === application.email)
    if (existingApp) {
      console.log('✅ Application already exists for:', application.email)
      console.log('   Status:', existingApp.status)
      console.log('   ID:', existingApp.id)
      return
    }

    // Add the new application
    const newApplications = [...existingApplications, application]
    ArtistApplicationService.saveApplications(newApplications)

    console.log('✅ Instructor application created successfully!')
    console.log('📊 Application Details:')
    console.log('   ID:', application.id)
    console.log('   Artist:', application.artistName)
    console.log('   Email:', application.email)
    console.log('   Business:', application.businessName)
    console.log('   Status:', application.status)
    console.log('   License:', application.licenseNumber)
    
    console.log('\n📝 Next Steps:')
    console.log('1. Go to staff-admin dashboard')
    console.log('2. Click on "Applications" tab')
    console.log('3. Find the application for admin@universalbeautystudio.com')
    console.log('4. Click "Approve" to give them access to Studio Supervision')
    
  } catch (error) {
    console.error('❌ Error creating application:', error.message)
  }
}

// Run the script
createInstructorApplication()
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
