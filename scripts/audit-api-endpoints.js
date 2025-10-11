const fs = require('fs');
const path = require('path');

console.log('🔍 API ENDPOINT SECURITY & ERROR HANDLING AUDIT\n');
console.log('='.repeat(70));

let issues = [];
let checked = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  checked++;
  let hasIssues = false;
  
  // Check 1: Has authentication check
  if (!content.includes('x-user-email') && !content.includes('authorization') && !content.includes('Authentication')) {
    if (!fileName.includes('test') && !fileName.includes('demo')) {
      issues.push(`⚠️ ${filePath}: Missing authentication header check`);
      hasIssues = true;
    }
  }
  
  // Check 2: Has error handling
  if (!content.includes('try') || !content.includes('catch')) {
    issues.push(`❌ ${filePath}: Missing try-catch error handling`);
    hasIssues = true;
  }
  
  // Check 3: Returns proper error responses
  if (!content.includes('500') && content.includes('export async function')) {
    issues.push(`⚠️ ${filePath}: May not handle 500 errors properly`);
    hasIssues = true;
  }
  
  // Check 4: Has input validation
  if (content.includes('POST') && !content.includes('if (!')) {
    issues.push(`⚠️ ${filePath}: POST endpoint may lack input validation`);
    hasIssues = true;
  }
  
  if (!hasIssues) {
    console.log(`   ✅ ${fileName}`);
  }
}

// Get all API route files
function getAllApiFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllApiFiles(fullPath));
    } else if (item === 'route.ts' || item === 'route.js') {
      files.push(fullPath);
    }
  }
  
  return files;
}

const apiDir = path.join(__dirname, '../app/api');
const apiFiles = getAllApiFiles(apiDir);

console.log(`\nFound ${apiFiles.length} API endpoints to audit\n`);

apiFiles.forEach(file => {
  if (!file.includes('node_modules') && !file.includes('.next')) {
    checkFile(file);
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\n📊 AUDIT SUMMARY:\n`);
console.log(`   Endpoints Checked: ${checked}`);
console.log(`   Issues Found: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n⚠️ ISSUES TO REVIEW:\n');
  issues.slice(0, 10).forEach(issue => console.log(`   ${issue}`));
  
  if (issues.length > 10) {
    console.log(`\n   ... and ${issues.length - 10} more issues`);
  }
} else {
  console.log('\n✅ All API endpoints have basic security and error handling');
}

console.log('\n🎯 RECOMMENDATION:');
if (issues.length === 0) {
  console.log('   ✅ API layer is secure for launch');
} else if (issues.length < 5) {
  console.log('   ⚠️ Review and fix issues before launch (low priority)');
} else {
  console.log('   🚨 Multiple API security concerns - review before launch');
}

