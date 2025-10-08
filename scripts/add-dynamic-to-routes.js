#!/usr/bin/env node

/**
 * Add dynamic = "force-dynamic" to all API routes to prevent static generation
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

async function addDynamicToRoutes() {
  console.log('🔧 Adding dynamic export to all API routes...\n');
  
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  const files = getAllRouteFiles(apiDir);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(process.cwd(), file);
    
    // Check if already has dynamic export
    if (content.includes('export const dynamic')) {
      console.log(`⏭️  Skipping: ${relativePath} (already has dynamic export)`);
      skippedCount++;
      continue;
    }
    
    // Check if file uses prisma (database)
    if (!content.includes('prisma') && !content.includes('@/lib/prisma')) {
      console.log(`⏭️  Skipping: ${relativePath} (no database usage)`);
      skippedCount++;
      continue;
    }
    
    console.log(`🔨 Adding dynamic export: ${relativePath}`);
    
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    // Insert dynamic export after imports
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, '', 'export const dynamic = "force-dynamic"');
      content = lines.join('\n');
      fs.writeFileSync(file, content, 'utf-8');
      console.log('  ✅ Added\n');
      addedCount++;
    } else {
      // No imports found, add at the beginning
      content = 'export const dynamic = "force-dynamic"\n\n' + content;
      fs.writeFileSync(file, content, 'utf-8');
      console.log('  ✅ Added (at beginning)\n');
      addedCount++;
    }
  }
  
  console.log(`\n✨ Summary:`);
  console.log(`   📝 Files processed: ${files.length}`);
  console.log(`   ✅ Dynamic exports added: ${addedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log('\n✅ All API routes marked as dynamic!');
}

addDynamicToRoutes().catch(console.error);

