import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Prevent destructive seeding in production
  if (process.env.NODE_ENV === 'production' && process.env.SEED_IN_PROD !== 'true') {
    console.log('🚫 Seed skipped in production environment');
    console.log('   To force seeding in production, set SEED_IN_PROD=true');
    process.exit(0);
  }

  console.log("🌱 Seeding database...")
  console.log(`   Environment: ${process.env.NODE_ENV}`)
  console.log(`   Database URL: ${process.env.DATABASE_URL?.substring(0, 20)}...`)

  console.log("✅ Database seeding complete - no demo data created")

  console.log("🎉 Database seeded successfully!")
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
