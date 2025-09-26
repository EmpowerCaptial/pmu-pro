#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up production database...')
  
  try {
    // Create demo user if it doesn't exist
    const demoUser = await prisma.user.upsert({
      where: { email: 'universalbeautystudioacademy@gmail.com' },
      update: {},
      create: {
        name: 'Universal Beauty Studio Academy',
        email: 'universalbeautystudioacademy@gmail.com',
        password: 'demo_password',
        businessName: 'Universal Beauty Studio Academy',
        licenseNumber: 'DEMO123',
        licenseState: 'CA',
        role: 'artist',
        hasActiveSubscription: true,
        subscriptionStatus: 'active'
      }
    })
    
    console.log('✅ Demo user created/found:', demoUser.email)
    
    // Create demo clients
    const demoClients = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: new Date('1990-05-15'),
        emergencyContact: 'John Johnson - +1 (555) 123-4568',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        skinType: 'Fitzpatrick Type II',
        notes: 'Prefers natural-looking results'
      },
      {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@example.com',
        phone: '+1 (555) 234-5678',
        dateOfBirth: new Date('1985-08-22'),
        emergencyContact: 'Carlos Rodriguez - +1 (555) 234-5679',
        medicalHistory: 'Mild eczema, well controlled',
        allergies: 'Latex sensitivity',
        skinType: 'Fitzpatrick Type III',
        notes: 'Very satisfied with previous microblading'
      },
      {
        name: 'Jennifer Chen',
        email: 'jennifer.chen@example.com',
        phone: '+1 (555) 345-6789',
        dateOfBirth: new Date('1992-12-10'),
        emergencyContact: 'David Chen - +1 (555) 345-6790',
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        skinType: 'Fitzpatrick Type IV',
        notes: 'First-time PMU client, very excited'
      }
    ]
    
    for (const clientData of demoClients) {
      const existingClient = await prisma.client.findFirst({
        where: {
          userId: demoUser.id,
          email: clientData.email
        }
      })
      
      if (!existingClient) {
        const client = await prisma.client.create({
          data: {
            ...clientData,
            userId: demoUser.id
          }
        })
        console.log('✅ Demo client created:', client.name)
      } else {
        console.log('ℹ️  Demo client already exists:', existingClient.name)
      }
    }
    
    // Create demo services
    const demoServices = [
      {
        name: 'Microblading',
        description: 'Semi-permanent eyebrow tattooing using microblading technique',
        defaultDuration: 120,
        defaultPrice: 350,
        category: 'eyebrows',
        isActive: true
      },
      {
        name: 'Lip Blush',
        description: 'Semi-permanent lip color enhancement',
        defaultDuration: 90,
        defaultPrice: 400,
        category: 'lips',
        isActive: true
      },
      {
        name: 'Eyeliner',
        description: 'Semi-permanent eyeliner application',
        defaultDuration: 60,
        defaultPrice: 300,
        category: 'eyeliner',
        isActive: true
      }
    ]
    
    for (const serviceData of demoServices) {
      const existingService = await prisma.service.findFirst({
        where: {
          userId: demoUser.id,
          name: serviceData.name
        }
      })
      
      if (!existingService) {
        const service = await prisma.service.create({
          data: {
            ...serviceData,
            userId: demoUser.id
          }
        })
        console.log('✅ Demo service created:', service.name)
      } else {
        console.log('ℹ️  Demo service already exists:', existingService.name)
      }
    }
    
    console.log('🎉 Production database setup complete!')
    console.log('📊 Summary:')
    console.log(`   - 1 demo user: ${demoUser.email}`)
    console.log(`   - 3 demo clients created`)
    console.log(`   - 3 demo services created`)
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
