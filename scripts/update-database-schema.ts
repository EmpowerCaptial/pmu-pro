import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDatabaseSchema() {
  try {
    console.log('🔄 Updating database schema...\n')
    
    // 1. Update existing clients with new fields (if they exist)
    console.log('1. Updating existing clients...')
    const existingClients = await prisma.client.findMany()
    
    if (existingClients.length > 0) {
      console.log(`   Found ${existingClients.length} existing clients`)
      
      // Update each client with default values for new fields
      for (const client of existingClients) {
        await prisma.client.update({
          where: { id: client.id },
          data: {
            isActive: true, // Set all existing clients as active
            // Other new fields will remain null (optional)
          }
        })
      }
      console.log('   ✅ Updated existing clients')
    } else {
      console.log('   ℹ️  No existing clients found')
    }
    
    // 2. Create sample documents for testing (if any clients exist)
    console.log('\n2. Creating sample documents...')
    if (existingClients.length > 0) {
      const sampleClient = existingClients[0]
      
      // Create sample documents
      const sampleDocuments = [
        {
          clientId: sampleClient.id,
          type: 'CONSENT_FORM' as const,
          fileUrl: '/sample-consent-form.pdf',
          filename: 'Consent Form.pdf',
          notes: 'Sample consent form for testing'
        },
        {
          clientId: sampleClient.id,
          type: 'INTAKE_FORM' as const,
          fileUrl: '/sample-intake-form.pdf',
          filename: 'Intake Form.pdf',
          notes: 'Sample intake form for testing'
        }
      ]
      
      for (const doc of sampleDocuments) {
        await prisma.document.create({ data: doc })
      }
      console.log('   ✅ Created sample documents')
    } else {
      console.log('   ℹ️  No clients found, skipping document creation')
    }
    
    // 3. Create sample procedures for testing (if any clients exist)
    console.log('\n3. Creating sample procedures...')
    if (existingClients.length > 0) {
      const sampleClient = existingClients[0]
      
      // Create sample procedures
      const sampleProcedures = [
        {
          clientId: sampleClient.id,
          procedureType: 'Microblading',
          voltage: 7.5,
          needleConfiguration: '18 needles, 0.18mm',
          pigmentBrand: 'Permablend',
          pigmentColor: 'Medium Brown',
          lotNumber: 'MB-2024-001',
          depth: '0.2-0.3mm',
          duration: 120,
          areaTreated: 'Eyebrows',
          notes: 'Sample microblading procedure',
          procedureDate: new Date(),
          isCompleted: true
        },
        {
          clientId: sampleClient.id,
          procedureType: 'Powder Brows',
          voltage: 8.0,
          needleConfiguration: '25 needles, 0.25mm',
          pigmentBrand: 'Permablend',
          pigmentColor: 'Dark Brown',
          lotNumber: 'DB-2024-002',
          depth: '0.3-0.4mm',
          duration: 90,
          areaTreated: 'Eyebrows',
          notes: 'Sample powder brows procedure',
          procedureDate: new Date(),
          isCompleted: false
        }
      ]
      
      for (const proc of sampleProcedures) {
        await prisma.procedure.create({ data: proc })
      }
      console.log('   ✅ Created sample procedures')
    } else {
      console.log('   ℹ️  No clients found, skipping procedure creation')
    }
    
    // 4. Display database summary
    console.log('\n4. Database summary:')
    const clientCount = await prisma.client.count()
    const documentCount = await prisma.document.count()
    const procedureCount = await prisma.procedure.count()
    
    console.log(`   📊 Clients: ${clientCount}`)
    console.log(`   📄 Documents: ${documentCount}`)
    console.log(`   🏥 Procedures: ${procedureCount}`)
    
    console.log('\n🎉 Database schema update complete!')
    console.log('\n📋 New tables created:')
    console.log('   • Documents (ID, consent, waiver, intake, contraindication, analysis)')
    console.log('   • Procedures (voltage, needle config, pigment details, lot numbers)')
    console.log('\n📋 Enhanced Client model:')
    console.log('   • Date of birth, emergency contact, medical history')
    console.log('   • Allergies, skin type, active status')
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateDatabaseSchema()
