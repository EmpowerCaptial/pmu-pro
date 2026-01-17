#!/usr/bin/env node

/**
 * Update Tierra's role to director to ensure CRM access
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

async function updateTierraRole() {
  try {
    console.log('🔧 UPDATING TIERRA ROLE FOR CRM ACCESS')
    console.log('======================================\n')

    const email = 'tierra@universalbeautystudio.com'
    const targetRole = 'director' // CRM requires: owner, staff, manager, or director

    // Get current user
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
        role: true
      }
    })

    if (!user) {
      console.log('❌ User not found!')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('📋 Current Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Current Role: ${user.role}`)
    console.log('')

    // Check if role already allows CRM
    const normalizedRole = user.role?.toLowerCase() || ''
    const allowedRoles = ['owner', 'staff', 'manager', 'director']
    const hasCrmAccess = allowedRoles.includes(normalizedRole)

    if (hasCrmAccess && normalizedRole === 'director') {
      console.log('✅ Tierra already has director role and CRM access!')
      console.log(`   Role "${user.role}" is in allowed list: ${allowedRoles.join(', ')}`)
      console.log('')
      console.log('💡 If CRM still not showing:')
      console.log('   1. Clear browser cache and cookies')
      console.log('   2. Log out and log back in')
      console.log('   3. Check that selectedPlan is "studio" or higher')
      await prisma.$disconnect()
      return
    }

    // Update role
    console.log(`🔄 Updating role from "${user.role}" to "${targetRole}"...`)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { role: targetRole }
    })

    console.log('✅ Role updated successfully!')
    console.log('')

    // Verify update
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    console.log('📋 Updated Details:')
    console.log(`   New Role: ${updatedUser.role}`)
    console.log('')

    // Check CRM access again
    const newNormalizedRole = updatedUser.role?.toLowerCase() || ''
    const nowHasAccess = allowedRoles.includes(newNormalizedRole)

    if (nowHasAccess) {
      console.log('✅ CRM Access Granted!')
      console.log('')
      console.log('📋 Next Steps:')
      console.log('   1. Tierra needs to log out and log back in')
      console.log('   2. Clear browser cache if needed')
      console.log('   3. CRM should now appear in the features page')
      console.log('')
      console.log('🔗 CRM URL: https://thepmuguide.com/crm')
    } else {
      console.log('❌ Something went wrong - role update may have failed')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateTierraRole()

