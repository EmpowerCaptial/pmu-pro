#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Source: Prisma Accelerate (hardcoded URL)
const accelerate = new PrismaClient({
  datasources: { db: { url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza190WTB4QWVfenNVY0toQTZIUHhTejIiLCJhcGlfa2V5IjoiMDFLNVhNRURDU0E5NTFDWFBCMVAwQUJEOVciLCJ0ZW5hbnRfaWQiOiI1ODkwYzJlNDA3YTg1YjY1YmY3ZGMwYjZiODcxM2JhMjNiMjMxOTczMjljNjVjNDRiY2Q5Yjk5Y2JmNmIxZGIzIiwiaW50ZXJuYWxfc2VjcmV0IjoiYzUwMmMwZTktMjgyMS00OWE2LTk0NWYtNzNlYzcxMWIzYjkwIn0.ocxMEnySjqpmYzNIjEuatvi_BDPP5NItSfkakrHyAoY" } }
});

// Target: Primary Neon (from env)
const primaryUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!primaryUrl) {
  console.error('Missing NEON_DATABASE_URL or DATABASE_URL for primary database.');
  process.exit(1);
}
const primary = new PrismaClient({ datasources: { db: { url: primaryUrl } } });

async function main() {
  console.log('🔄 Migrating services from Accelerate → Primary...');

  // Find Tyrone's user(s) in Accelerate
  const tyroneUsers = await accelerate.user.findMany({
    where: {
      OR: [
        { email: { equals: 'tyronejackboy@gmail.com', mode: 'insensitive' } },
        { studioName: { equals: 'Universal Beauty Studio Academy', mode: 'insensitive' } }
      ]
    },
    select: { id: true, email: true, studioName: true }
  });
  if (!tyroneUsers.length) {
    console.log('⚠️ No Tyrone users found in Accelerate. Aborting.');
    return;
  }
  const tyroneUserIds = tyroneUsers.map(u => u.id);
  console.log(`👤 Found ${tyroneUsers.length} Tyrone-related users in Accelerate.`);

  // Pull services owned by those users
  const services = await accelerate.service.findMany({
    where: { userId: { in: tyroneUserIds } },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`🧾 Found ${services.length} services in Accelerate.`);

  // Filter for services that look like they used public images (or any image present)
  const withImages = services.filter(s => typeof s.imageUrl === 'string' && s.imageUrl.length > 0);
  console.log(`🖼️ Services with images: ${withImages.length}`);

  let created = 0, updated = 0;

  for (const svc of withImages) {
    // Ensure the owner exists in primary DB (match by email via accelerate -> user relation fetch)
    const owner = await accelerate.user.findUnique({ where: { id: svc.userId } });
    if (!owner) continue;

    const primaryOwner = await primary.user.findUnique({ where: { email: owner.email } });
    if (!primaryOwner) {
      console.log(`⚠️ Skipping service '${svc.name}' - owner ${owner.email} not found in primary DB`);
      continue;
    }

    // Upsert by unique (ownerId + name) to avoid duplicates
    const existing = await primary.service.findFirst({ where: { userId: primaryOwner.id, name: svc.name } });

    const data = {
      name: svc.name,
      description: svc.description || null,
      defaultPrice: svc.defaultPrice || 0,
      duration: svc.duration || 60,
      category: svc.category || null,
      imageUrl: svc.imageUrl, // keep original path (e.g., /images/...) or data URI
      isActive: svc.isActive ?? true,
      metadata: svc.metadata || undefined,
      userId: primaryOwner.id
    };

    if (existing) {
      await primary.service.update({ where: { id: existing.id }, data });
      updated++;
      console.log(`♻️ Updated: ${svc.name}`);
    } else {
      await primary.service.create({ data: { ...data, createdAt: svc.createdAt, updatedAt: svc.updatedAt } });
      created++;
      console.log(`✅ Created: ${svc.name}`);
    }
  }

  console.log(`\n✅ Done. Created: ${created}, Updated: ${updated}`);
}

main()
  .catch(err => { console.error('❌ Migration error:', err?.message || err); process.exit(1); })
  .finally(async () => { await accelerate.$disconnect(); await primary.$disconnect(); });
