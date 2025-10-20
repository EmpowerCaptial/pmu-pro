#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Source database (Prisma Accelerate)
const acceleratePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza190WTB4QWVfenNVY0toQTZIUHhTejIiLCJhcGlfa2V5IjoiMDFLNVhNRURDU0E5NTFDWFBCMVAwQUJEOVciLCJ0ZW5hbnRfaWQiOiI1ODkwYzJlNDA3YTg1YjY1YmY3ZGMwYjZiODcxM2JhMjNiMjMxOTczMjljNjVjNDRiY2Q5Yjk5Y2JmNmIxZGIzIiwiaW50ZXJuYWxfc2VjcmV0IjoiYzUwMmMwZTktMjgyMS00OWE2LTk0NWYtNzNlYzcxMWIzYjkwIn0.ocxMEnySjqpmYzNIjEuatvi_BDPP5NItSfkakrHyAoY"
    }
  }
});

// Target database (Primary Neon)
const primaryPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Starting data migration from Prisma Accelerate to Primary Database...\n');

  try {
    // 1. Migrate Users
    console.log('👥 Migrating users...');
    const users = await acceleratePrisma.user.findMany({
      where: {
        studioName: 'Universal Beauty Studio Academy'
      }
    });

    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await primaryPrisma.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          console.log(`  ⚠️  User ${user.email} already exists, updating...`);
          await primaryPrisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name,
              role: user.role,
              businessName: user.businessName,
              studioName: user.studioName,
              avatar: user.avatar,
              phone: user.phone,
              address: user.address,
              city: user.city,
              state: user.state,
              zipCode: user.zipCode,
              country: user.country,
              website: user.website,
              instagram: user.instagram,
              facebook: user.facebook,
              twitter: user.twitter,
              linkedin: user.linkedin,
              tiktok: user.tiktok,
              youtube: user.youtube,
              bio: user.bio,
              specialties: user.specialties,
              certifications: user.certifications,
              experience: user.experience,
              languages: user.languages,
              timezone: user.timezone,
              isActive: user.isActive,
              emailVerified: user.emailVerified,
              lastLoginAt: user.lastLoginAt,
              preferences: user.preferences,
              metadata: user.metadata
            }
          });
        } else {
          console.log(`  ✅ Creating user ${user.email}`);
          await primaryPrisma.user.create({
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              businessName: user.businessName,
              studioName: user.studioName,
              avatar: user.avatar,
              phone: user.phone,
              address: user.address,
              city: user.city,
              state: user.state,
              zipCode: user.zipCode,
              country: user.country,
              website: user.website,
              instagram: user.instagram,
              facebook: user.facebook,
              twitter: user.twitter,
              linkedin: user.linkedin,
              tiktok: user.tiktok,
              youtube: user.youtube,
              bio: user.bio,
              specialties: user.specialties,
              certifications: user.certifications,
              experience: user.experience,
              languages: user.languages,
              timezone: user.timezone,
              isActive: user.isActive,
              emailVerified: user.emailVerified,
              lastLoginAt: user.lastLoginAt,
              preferences: user.preferences,
              metadata: user.metadata,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        }
      } catch (error) {
        console.error(`  ❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    // 2. Migrate Services
    console.log('\n📚 Migrating services...');
    const services = await acceleratePrisma.service.findMany({
      where: {
        user: {
          studioName: 'Universal Beauty Studio Academy'
        }
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${services.length} services to migrate`);
    
    for (const service of services) {
      try {
        // Check if service already exists
        const existingService = await primaryPrisma.service.findFirst({
          where: {
            name: service.name,
            userId: service.userId
          }
        });

        if (existingService) {
          console.log(`  ⚠️  Service "${service.name}" already exists, updating...`);
          await primaryPrisma.service.update({
            where: { id: existingService.id },
            data: {
              description: service.description,
              defaultPrice: service.defaultPrice,
              duration: service.duration,
              category: service.category,
              imageUrl: service.imageUrl,
              isActive: service.isActive,
              metadata: service.metadata,
              updatedAt: service.updatedAt
            }
          });
        } else {
          console.log(`  ✅ Creating service "${service.name}"`);
          await primaryPrisma.service.create({
            data: {
              id: service.id,
              name: service.name,
              description: service.description,
              defaultPrice: service.defaultPrice,
              duration: service.duration,
              category: service.category,
              imageUrl: service.imageUrl,
              userId: service.userId,
              isActive: service.isActive,
              metadata: service.metadata,
              createdAt: service.createdAt,
              updatedAt: service.updatedAt
            }
          });
        }
      } catch (error) {
        console.error(`  ❌ Error migrating service "${service.name}":`, error.message);
      }
    }

    // 3. Migrate Clients
    console.log('\n👤 Migrating clients...');
    const clients = await acceleratePrisma.client.findMany({
      where: {
        user: {
          studioName: 'Universal Beauty Studio Academy'
        }
      }
    });

    console.log(`Found ${clients.length} clients to migrate`);
    
    for (const client of clients) {
      try {
        // Check if client already exists
        const existingClient = await primaryPrisma.client.findFirst({
          where: {
            email: client.email,
            userId: client.userId
          }
        });

        if (existingClient) {
          console.log(`  ⚠️  Client ${client.email} already exists, updating...`);
          await primaryPrisma.client.update({
            where: { id: existingClient.id },
            data: {
              name: client.name,
              phone: client.phone,
              address: client.address,
              city: client.city,
              state: client.state,
              zipCode: client.zipCode,
              country: client.country,
              dateOfBirth: client.dateOfBirth,
              emergencyContact: client.emergencyContact,
              emergencyPhone: client.emergencyPhone,
              allergies: client.allergies,
              medications: client.medications,
              skinType: client.skinType,
              skinTone: client.skinTone,
              previousPMU: client.previousPMU,
              previousPMUDetails: client.previousPMUDetails,
              notes: client.notes,
              isActive: client.isActive,
              metadata: client.metadata,
              updatedAt: client.updatedAt
            }
          });
        } else {
          console.log(`  ✅ Creating client ${client.email}`);
          await primaryPrisma.client.create({
            data: {
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              address: client.address,
              city: client.city,
              state: client.state,
              zipCode: client.zipCode,
              country: client.country,
              dateOfBirth: client.dateOfBirth,
              emergencyContact: client.emergencyContact,
              emergencyPhone: client.emergencyPhone,
              allergies: client.allergies,
              medications: client.medications,
              skinType: client.skinType,
              skinTone: client.skinTone,
              previousPMU: client.previousPMU,
              previousPMUDetails: client.previousPMUDetails,
              notes: client.notes,
              userId: client.userId,
              isActive: client.isActive,
              metadata: client.metadata,
              createdAt: client.createdAt,
              updatedAt: client.updatedAt
            }
          });
        }
      } catch (error) {
        console.error(`  ❌ Error migrating client ${client.email}:`, error.message);
      }
    }

    // 4. Migrate Appointments
    console.log('\n📅 Migrating appointments...');
    const appointments = await acceleratePrisma.appointment.findMany({
      where: {
        user: {
          studioName: 'Universal Beauty Studio Academy'
        }
      }
    });

    console.log(`Found ${appointments.length} appointments to migrate`);
    
    for (const appointment of appointments) {
      try {
        // Check if appointment already exists
        const existingAppointment = await primaryPrisma.appointment.findFirst({
          where: {
            id: appointment.id
          }
        });

        if (existingAppointment) {
          console.log(`  ⚠️  Appointment ${appointment.id} already exists, updating...`);
          await primaryPrisma.appointment.update({
            where: { id: appointment.id },
            data: {
              title: appointment.title,
              description: appointment.description,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              duration: appointment.duration,
              price: appointment.price,
              deposit: appointment.deposit,
              status: appointment.status,
              serviceType: appointment.serviceType,
              clientId: appointment.clientId,
              notes: appointment.notes,
              metadata: appointment.metadata,
              updatedAt: appointment.updatedAt
            }
          });
        } else {
          console.log(`  ✅ Creating appointment ${appointment.id}`);
          await primaryPrisma.appointment.create({
            data: {
              id: appointment.id,
              title: appointment.title,
              description: appointment.description,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              duration: appointment.duration,
              price: appointment.price,
              deposit: appointment.deposit,
              status: appointment.status,
              serviceType: appointment.serviceType,
              userId: appointment.userId,
              clientId: appointment.clientId,
              notes: appointment.notes,
              metadata: appointment.metadata,
              createdAt: appointment.createdAt,
              updatedAt: appointment.updatedAt
            }
          });
        }
      } catch (error) {
        console.error(`  ❌ Error migrating appointment ${appointment.id}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`- Clients: ${clients.length}`);
    console.log(`- Appointments: ${appointments.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await acceleratePrisma.$disconnect();
    await primaryPrisma.$disconnect();
  }
}

// Run the migration
migrateData();
