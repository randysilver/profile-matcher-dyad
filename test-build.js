#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running build diagnostics...\n');

// Check if we're in a Vercel-like environment
console.log('1. Checking environment...');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());
console.log('');

// Check package.json
console.log('2. Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✓ package.json parsed successfully');
  console.log('Name:', packageJson.name);
  console.log('Type:', packageJson.type);
  console.log('Dependencies count:', Object.keys(packageJson.dependencies || {}).length);
  console.log('Dev dependencies count:', Object.keys(packageJson.devDependencies || {}).length);
} catch (error) {
  console.log('✗ Error parsing package.json:', error.message);
  process.exit(1);
}
console.log('');

// Check for lockfiles
console.log('3. Checking lockfiles...');
const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
lockfiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ Found ${file}`);
  } else {
    console.log(`✗ Missing ${file}`);
  }
});
console.log('');

// Check critical files
console.log('4. Checking critical files...');
const criticalFiles = [
  'vite.config.ts',
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/globals.css'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ Found ${file}`);
  } else {
    console.log(`✗ Missing ${file}`);
  }
});
console.log('');

// Check for build errors by attempting a build
console.log('5. Attempting build...');
try {
  // First, install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✓ Dependencies installed successfully');
  
  // Then attempt build
  console.log('Attempting build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✓ Build completed successfully');
  
  // Check build output
  const distExists = fs.existsSync('dist');
  const distFiles = distExists ? fs.readdirSync('dist') : [];
  console.log('Build output:', distExists ? `${distFiles.length} files in dist/` : 'No dist directory');
  
} catch (error) {
  console.log('✗ Build failed:', error.message);
  console.log('Build error output:', error.stdout?.toString() || error.stderr?.toString());
  process.exit(1);
}
console.log('');

console.log('✅ All diagnostics completed successfully!');