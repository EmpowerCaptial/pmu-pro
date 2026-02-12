import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedLocations() {
  try {
    console.log('🌱 Seeding locations...')

    // Check if locations already exist
    const existingLocations = await prisma.location.findMany()
    if (existingLocations.length > 0) {
      console.log('✅ Locations already exist, skipping seed')
      return
    }

    // Create Springfield Missouri location
    const springfield = await prisma.location.create({
      data: {
        name: 'Springfield Missouri',
        city: 'Springfield',
        state: 'Missouri',
        isActive: true
      }
    })
    console.log('✅ Created location: Springfield Missouri')

    // Create Blue Springs Missouri HHBC location
    const blueSprings = await prisma.location.create({
      data: {
        name: 'Blue Springs Missouri HHBC',
        city: 'Blue Springs',
        state: 'Missouri',
        isActive: true
      }
    })
    console.log('✅ Created location: Blue Springs Missouri HHBC')

    console.log('🎉 Successfully seeded locations!')
  } catch (error) {
    console.error('❌ Error seeding locations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedLocations()

