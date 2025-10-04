#!/usr/bin/env node

/**
 * Check the actual database table structure
 */

const { PrismaClient } = require('@prisma/client')

async function checkTableStructure() {
  try {
    console.log('🔍 CHECKING DATABASE TABLE STRUCTURE...')
    console.log('========================================')
    
    const prisma = new PrismaClient()
    await prisma.$connect()
    
    // Check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log('📊 Available tables:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    console.log('')
    
    // Check User table columns (try different cases)
    const userTableNames = ['User', 'user', 'users', 'Users']
    
    for (const tableName of userTableNames) {
      try {
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = ${tableName}
        `
        
        if (columns.length > 0) {
          console.log(`📊 Columns in "${tableName}" table:`)
          columns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`)
          })
          console.log('')
          
          // Check if emailNotifications exists
          const hasEmailNotifications = columns.some(col => col.column_name === 'emailNotifications')
          console.log(`✅ emailNotifications column exists: ${hasEmailNotifications ? 'YES' : 'NO'}`)
          break
        }
      } catch (error) {
        // Table doesn't exist with this name, continue
      }
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error)
  }
}

checkTableStructure()
