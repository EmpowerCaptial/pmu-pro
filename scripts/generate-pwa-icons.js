const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Icon sizes for PWA
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Create placeholder icon files
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Create a simple SVG placeholder that can be converted to PNG
  const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">PMU</text>
</svg>`;

  // For now, create a text file with SVG content (you can convert these to PNG later)
  const textContent = `# PMU Pro Icon ${size}x${size}
# This is a placeholder icon file
# Replace with actual PNG icon of size ${size}x${size}
# 
# SVG Content:
${svgContent}
`;

  fs.writeFileSync(iconPath.replace('.png', '.txt'), textContent);
  console.log(`Created placeholder icon: icon-${size}x${size}.txt`);
});

// Create Apple touch icon placeholder
const appleIconPath = path.join(iconsDir, 'apple-touch-icon.txt');
const appleIconContent = `# PMU Pro Apple Touch Icon 180x180
# This is a placeholder icon file
# Replace with actual PNG icon of size 180x180
# 
# This icon is used when users add PMU Pro to their iOS home screen
`;

fs.writeFileSync(appleIconPath, appleIconContent);
console.log('Created placeholder Apple touch icon');

// Create screenshot placeholders
const screenshots = [
  { name: 'dashboard-mobile.png', size: '390x844', description: 'Mobile dashboard view' },
  { name: 'skin-analysis-mobile.png', size: '390x844', description: 'Mobile skin analysis' },
  { name: 'dashboard-desktop.png', size: '1920x1080', description: 'Desktop dashboard view' }
];

screenshots.forEach(screenshot => {
  const screenshotPath = path.join(screenshotsDir, screenshot.name.replace('.png', '.txt'));
  const screenshotContent = `# PMU Pro Screenshot: ${screenshot.name}
# Size: ${screenshot.size}
# Description: ${screenshot.description}
# 
# This is a placeholder screenshot file
# Replace with actual PNG screenshot of size ${screenshot.size}
# 
# Screenshots are used in the PWA manifest to show users what the app looks like
# when they're considering installing it
`;

  fs.writeFileSync(screenshotPath, screenshotContent);
  console.log(`Created placeholder screenshot: ${screenshot.name.replace('.png', '.txt')}`);
});

console.log('\nPWA icon and screenshot placeholders created successfully!');
console.log('\nNext steps:');
console.log('1. Replace the .txt files with actual PNG images');
console.log('2. Icons should be square PNG files of the specified sizes');
console.log('3. Screenshots should be PNG files of the specified dimensions');
console.log('4. Use tools like Figma, Photoshop, or online icon generators to create the actual icons');
console.log('\nFor now, the PWA will work with placeholder icons, but users will see generic icons.');
