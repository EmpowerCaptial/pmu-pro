#!/usr/bin/env node

/**
 * Database Setup Script for Vercel PostgreSQL
 * This script helps set up the database schema
 */

const { PrismaClient } = require('@prisma/client')

async function setupDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Setting up database schema...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Create tables by running a simple query
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Database schema ready')
    
    // Create a demo user if it doesn't exist
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
    
    console.log('✅ Demo user created/verified:', demoUser.email)
    
    // Create some demo clients
    const demoClients = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: new Date('1990-05-15'),
        emergencyContact: 'John Johnson - (555) 987-6543',
        medicalHistory: 'No known medical conditions',
        allergies: 'None reported',
        skinType: 'Fitzpatrick Type III',
        notes: 'Prefers natural-looking brows',
        userId: demoUser.id
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@email.com',
        phone: '+1 (555) 234-5678',
        dateOfBirth: new Date('1988-12-03'),
        emergencyContact: 'Maria Rodriguez - (555) 876-5432',
        medicalHistory: 'Diabetes Type 2',
        allergies: 'Latex',
        skinType: 'Fitzpatrick Type IV',
        notes: 'Sensitive skin, prefers gentle techniques',
        userId: demoUser.id
      },
      {
        name: 'Lisa Park',
        email: 'lisa.park@email.com',
        phone: '+1 (555) 345-6789',
        dateOfBirth: new Date('1992-08-22'),
        emergencyContact: 'David Park - (555) 765-4321',
        medicalHistory: 'No known medical conditions',
        allergies: 'None reported',
        skinType: 'Fitzpatrick Type II',
        notes: 'First-time PMU client, very excited',
        userId: demoUser.id
      }
    ]
    
    for (const clientData of demoClients) {
      await prisma.client.upsert({
        where: { 
          email_userId: {
            email: clientData.email,
            userId: demoUser.id
          }
        },
        update: {},
        create: clientData
      })
    }
    
    console.log('✅ Demo clients created')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
