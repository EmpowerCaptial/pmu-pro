#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get current timestamp for version
const now = new Date();
const version = `v1.${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

const swPath = path.join(__dirname, '..', 'public', 'sw.js');

try {
  // Read the current service worker file
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Update the cache name with new version
  const newCacheName = `pmu-pro-${version}`;
  swContent = swContent.replace(
    /const CACHE_NAME = '[^']+';/,
    `const CACHE_NAME = '${newCacheName}';`
  );
  
  // Write the updated service worker file
  fs.writeFileSync(swPath, swContent);
  
  console.log(`✅ PWA version updated to: ${version}`);
  console.log(`📦 Cache name: ${newCacheName}`);
  
} catch (error) {
  console.error('❌ Failed to update PWA version:', error);
  process.exit(1);
}


