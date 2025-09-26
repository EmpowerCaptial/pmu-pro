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

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@pmuPro.com" },
    update: {},
    create: {
      email: "demo@pmuPro.com",
      name: "Demo PMU Artist",
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewFBnXt.BVG/sBNO", // bcrypt hash of "demo123"
      businessName: "Demo PMU Studio",
      phone: "+1-555-DEMO",
      licenseNumber: "PMU-12345",
      licenseState: "CA",
      yearsExperience: "5+",
      selectedPlan: "pro",
      hasActiveSubscription: false,
      isLicenseVerified: true,
      role: "artist",
      subscriptionStatus: "inactive"
    },
  })

  console.log("✅ Created demo user:", demoUser.email)

  // Create some demo clients
  const client1 = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-0123",
      notes: "First-time PMU client, interested in microblading",
    },
  })

  const client2 = await prisma.client.create({
    data: {
      userId: demoUser.id,
      name: "Maria Garcia",
      email: "maria@example.com",
      phone: "+1-555-0124",
      notes: "Returning client for lip blush touch-up",
    },
  })

  console.log("✅ Created demo clients")

  // Create some demo intakes
  await prisma.intake.create({
    data: {
      clientId: client1.id,
      conditions: '["none"]',
      medications: '["none"]',
      result: "safe",
      rationale: "No contraindications found. Client is suitable for PMU procedures.",
      flaggedItems: '[]',
    },
  })

  await prisma.intake.create({
    data: {
      clientId: client2.id,
      conditions: '["sensitive_skin"]',
      medications: '["aspirin"]',
      result: "precaution",
      rationale:
        "Client takes aspirin (blood thinner) and has sensitive skin. Recommend patch test and inform about increased bleeding risk.",
      flaggedItems: '["aspirin", "sensitive_skin"]',
    },
  })

  console.log("✅ Created demo intakes")

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
