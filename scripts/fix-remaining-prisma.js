#!/usr/bin/env node

/**
 * Fix remaining duplicate prisma definitions
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

async function fixRemainingPrisma() {
  console.log('🔧 Fixing remaining Prisma duplicates...\n');
  
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  const files = getAllRouteFiles(apiDir);
  
  let fixedCount = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(process.cwd(), file);
    
    // Check if file has duplicate definitions
    if (content.includes("import { prisma } from '@/lib/prisma'") && 
        content.includes('const prisma = new PrismaClient()')) {
      
      console.log(`🔨 Fixing: ${relativePath}`);
      
      // Remove the const prisma = new PrismaClient() line
      content = content.replace(/const prisma = new PrismaClient\(\);?\s*\n/g, '');
      
      // Also remove any lingering import of PrismaClient that's now unused
      const lines = content.split('\n');
      const cleanedLines = lines.filter(line => {
        // Skip lines that only import PrismaClient and nothing else
        if (line.trim() === "import { PrismaClient } from '@prisma/client';" ||
            line.trim() === 'import { PrismaClient } from "@prisma/client";') {
          return false;
        }
        return true;
      });
      
      content = cleanedLines.join('\n');
      
      fs.writeFileSync(file, content, 'utf-8');
      console.log('  ✅ Fixed\n');
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with duplicate prisma definitions`);
}

fixRemainingPrisma().catch(console.error);

