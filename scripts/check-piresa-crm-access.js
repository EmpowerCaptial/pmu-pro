#!/usr/bin/env node

/**
 * Check Piresa's role and CRM access
 */

const { PrismaClient } = require('@prisma/client')

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set!')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
})

async function checkCrmAccess() {
  try {
    console.log('🔍 CHECKING PIRESA CRM ACCESS')
    console.log('==============================\n')

    const email = 'piresa@universalbeautystudio.com'

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim().toLowerCase(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true
      }
    })

    if (!user) {
      console.log('❌ User not found!')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('📋 User Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Plan: ${user.selectedPlan}`)
    console.log(`   Subscription Status: ${user.subscriptionStatus}`)
    console.log(`   Has Active Subscription: ${user.hasActiveSubscription}`)
    console.log('')

    // Check CRM access rules
    const normalizedRole = user.role?.toLowerCase() || ''
    console.log('📊 CRM Access Check:')
    console.log(`   Normalized Role: "${normalizedRole}"`)
    console.log(`   Required Roles: owner, staff, manager, director`)
    
    const allowedRoles = ['owner', 'staff', 'manager', 'director']
    const hasCrmAccess = allowedRoles.includes(normalizedRole)
    
    console.log(`   Has CRM Access: ${hasCrmAccess ? '✅ YES' : '❌ NO'}`)
    console.log('')

    // Check features page filter
    console.log('📊 Features Page Filter:')
    console.log('   Code checks: normalizedRole === "owner" || normalizedRole === "staff"')
    const featuresPageAccess = normalizedRole === 'owner' || normalizedRole === 'staff'
    console.log(`   Would show in features page: ${featuresPageAccess ? '✅ YES' : '❌ NO'}`)
    console.log('')

    if (!hasCrmAccess) {
      console.log('💡 RECOMMENDATION:')
      console.log(`   Update Piresa's role to one of: owner, staff, manager, director`)
      console.log(`   Current role: "${user.role}"`)
      console.log('')
    } else if (!featuresPageAccess) {
      console.log('⚠️  ISSUE FOUND:')
      console.log('   CRM access is allowed, but features page filter might be wrong')
      console.log(`   Role "${normalizedRole}" should show CRM but might not`)
      console.log('')
    }

    // Check if role needs updating
    if (!hasCrmAccess || !featuresPageAccess) {
      console.log('🔧 FIX OPTIONS:')
      console.log('   1. Update role to "staff" (recommended)')
      console.log('   2. Or update role to "manager" or "director"')
      console.log('')
      console.log('   Run this to fix:')
      console.log(`   node scripts/update-piresa-role.js`)
    } else {
      console.log('✅ All checks passed!')
      console.log('   Piresa should see CRM in features page')
      console.log('')
      console.log('💡 If CRM still not showing:')
      console.log('   1. Clear browser cache')
      console.log('   2. Log out and log back in')
      console.log('   3. Check browser console for errors')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkCrmAccess()

