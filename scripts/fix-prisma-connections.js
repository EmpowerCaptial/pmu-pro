#!/usr/bin/env node

/**
 * Fix all API routes to use the singleton Prisma client
 * This fixes the "Server has closed the connection" error
 */

const fs = require('fs');
const path = require('path');

function getAllRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllRouteFiles(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function fixPrismaConnections() {
  console.log('🔧 Fixing Prisma connections in API routes...\n');
  
  // Find all route.ts files in app/api
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  const files = getAllRouteFiles(apiDir);
  
  console.log(`📁 Found ${files.length} API route files\n`);
  
  let fixedCount = 0;
  let disconnectFixedCount = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;
    const relativePath = path.relative(process.cwd(), file);
    
    // Check if file has the problematic pattern
    if (content.includes('const prisma = new PrismaClient()')) {
      console.log(`🔨 Fixing: ${relativePath}`);
      
      // Step 1: Replace the import
      if (content.includes("import { PrismaClient } from '@prisma/client'")) {
        content = content.replace(
          /import { PrismaClient } from '@prisma\/client'/g,
          "import { prisma } from '@/lib/prisma'"
        );
        console.log('  ✓ Updated import statement');
      } else if (content.includes('from "@prisma/client"')) {
        // Handle double quotes
        content = content.replace(
          /import { PrismaClient } from "@prisma\/client"/g,
          'import { prisma } from "@/lib/prisma"'
        );
        console.log('  ✓ Updated import statement');
      }
      
      // Step 2: Remove const prisma = new PrismaClient() lines
      const beforeLines = content.split('\n').length;
      content = content.replace(/const prisma = new PrismaClient\(\)\s*\n/g, '');
      const afterLines = content.split('\n').length;
      if (beforeLines !== afterLines) {
        console.log('  ✓ Removed new PrismaClient() instance');
      }
      
      modified = true;
      fixedCount++;
    }
    
    // Step 3: Remove all $disconnect() calls
    if (content.includes('$disconnect()')) {
      console.log(`🧹 Removing $disconnect() from: ${relativePath}`);
      
      // Remove entire finally blocks that only contain disconnect
      content = content.replace(/\s*finally\s*{\s*await\s+prisma\.\$disconnect\(\)\s*}\s*/g, '');
      
      // Remove standalone disconnect calls
      content = content.replace(/\s*await\s+prisma\.\$disconnect\(\)\s*\n/g, '');
      content = content.replace(/\s*prisma\.\$disconnect\(\)\s*\n/g, '');
      
      console.log('  ✓ Removed $disconnect() calls');
      modified = true;
      disconnectFixedCount++;
    }
    
    // Write the file back if modified
    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log('  ✅ File saved\n');
    }
  }
  
  console.log('\n✨ Summary:');
  console.log(`   📝 Files processed: ${files.length}`);
  console.log(`   🔧 PrismaClient instances fixed: ${fixedCount}`);
  console.log(`   🧹 $disconnect() calls removed: ${disconnectFixedCount}`);
  console.log('\n✅ All API routes now use the singleton Prisma client!');
}

fixPrismaConnections().catch(console.error);

