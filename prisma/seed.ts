import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@pmupro.com',
      name: 'Admin User',
    },
  })

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0123',
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0456',
    },
  })

  console.log('Seeding completed:', { user1, client1, client2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
