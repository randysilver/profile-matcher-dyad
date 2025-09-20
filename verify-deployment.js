#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment configuration...\n');

// Check required files
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/globals.css',
  'src/pages/Index.tsx',
  'vercel.json'
];

console.log('1. Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(exists ? `✓ ${file}` : `✗ ${file}`);
  if (!exists) allFilesExist = false;
});
console.log('');

// Check package.json structure
console.log('2. Checking package.json structure...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredFields = ['name', 'version', 'type', 'scripts', 'dependencies', 'devDependencies'];
  
  requiredFields.forEach(field => {
    const hasField = packageJson[field] !== undefined;
    console.log(hasField ? `✓ ${field}` : `✗ ${field}`);
    if (!hasField) allFilesExist = false;
  });
  
  // Check for build script
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✓ build script');
  } else {
    console.log('✗ build script');
    allFilesExist = false;
  }
  
} catch (error) {
  console.log('✗ Error reading package.json:', error.message);
  allFilesExist = false;
}
console.log('');

// Check Vercel config
console.log('3. Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const hasBuilds = vercelConfig.builds && vercelConfig.builds.length > 0;
  const hasRoutes = vercelConfig.routes && vercelConfig.routes.length > 0;
  
  console.log(hasBuilds ? '✓ builds config' : '✗ builds config');
  console.log(hasRoutes ? '✓ routes config' : '✗ routes config');
  
  if (!hasBuilds || !hasRoutes) allFilesExist = false;
  
} catch (error) {
  console.log('✗ Error reading vercel.json:', error.message);
  allFilesExist = false;
}
console.log('');

// Final result
if (allFilesExist) {
  console.log('✅ Deployment configuration is valid!');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Push to GitHub');
  console.log('4. Deploy on Vercel');
} else {
  console.log('❌ Deployment configuration has issues.');
  console.log('Please check the missing files or configurations above.');
  process.exit(1);
}