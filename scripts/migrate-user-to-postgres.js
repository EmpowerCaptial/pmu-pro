const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const prisma = new PrismaClient();
const sqliteDb = new sqlite3.Database(path.join(__dirname, '../prisma/dev.db'));

async function migrateUser() {
  try {
    console.log('🔄 Starting user migration from SQLite to PostgreSQL...');
    
    // Get user from SQLite
    const user = await new Promise((resolve, reject) => {
      sqliteDb.get(
        "SELECT * FROM users WHERE email = 'tyronejackboy@gmail.com'",
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      console.log('❌ User not found in SQLite database');
      return;
    }

    console.log('📋 Found user in SQLite:', user.email);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        businessName: user.businessName,
        phone: user.phone,
        licenseNumber: user.licenseNumber,
        licenseState: user.licenseState,
        yearsExperience: user.yearsExperience,
        selectedPlan: user.selectedPlan,
        hasActiveSubscription: user.hasActiveSubscription === 1,
        isLicenseVerified: user.isLicenseVerified === 1,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: new Date(parseInt(user.createdAt)),
        updatedAt: new Date(parseInt(user.updatedAt))
      }
    });

    console.log('✅ User created in PostgreSQL:', newUser.email);
    console.log('🆔 New user ID:', newUser.id);

    // Get clients from SQLite
    const clients = await new Promise((resolve, reject) => {
      sqliteDb.all(
        "SELECT * FROM clients WHERE userId = ?",
        [user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`📋 Found ${clients.length} clients in SQLite`);

    // Migrate clients
    for (const client of clients) {
      await prisma.client.create({
        data: {
          name: client.name,
          email: client.email,
          phone: client.phone,
          userId: newUser.id,
          medicalHistory: client.medicalHistory,
          allergies: client.allergies,
          skinType: client.skinType,
          isActive: client.isActive === 1,
          createdAt: new Date(parseInt(client.createdAt)),
          updatedAt: new Date(parseInt(client.updatedAt))
        }
      });
    }

    console.log(`✅ Migrated ${clients.length} clients`);

    // Get services from SQLite
    const services = await new Promise((resolve, reject) => {
      sqliteDb.all(
        "SELECT * FROM services WHERE userId = ?",
        [user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`📋 Found ${services.length} services in SQLite`);

    // Migrate services
    for (const service of services) {
      await prisma.service.create({
        data: {
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          category: service.category,
          userId: newUser.id,
          isActive: service.isActive === 1,
          imageUrl: service.imageUrl,
          createdAt: new Date(parseInt(service.createdAt)),
          updatedAt: new Date(parseInt(service.updatedAt))
        }
      });
    }

    console.log(`✅ Migrated ${services.length} services`);

    // Get products from SQLite
    const products = await new Promise((resolve, reject) => {
      sqliteDb.all(
        "SELECT * FROM products WHERE userId = ?",
        [user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    console.log(`📋 Found ${products.length} products in SQLite`);

    // Migrate products
    for (const product of products) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          userId: newUser.id,
          isActive: product.isActive === 1,
          images: product.images,
          createdAt: new Date(parseInt(product.createdAt)),
          updatedAt: new Date(parseInt(product.updatedAt))
        }
      });
    }

    console.log(`✅ Migrated ${products.length} products`);

    console.log('🎉 Migration completed successfully!');
    console.log(`👤 User: ${newUser.email}`);
    console.log(`🏢 Studio: ${newUser.businessName}`);
    console.log(`📊 Status: ${newUser.subscriptionStatus}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
    sqliteDb.close();
  }
}

migrateUser();
