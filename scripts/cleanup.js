#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('\n========================================');
console.log('  Cleaning up port 3000 and cache');
console.log('========================================\n');

// Step 1: Kill Node processes
console.log('[1/4] Killing Node processes...');
try {
  if (os.platform() === 'win32') {
    execSync('taskkill /IM node.exe /F 2>nul', { stdio: 'pipe' });
  } else {
    execSync('pkill -f "node" || true', { stdio: 'pipe' });
  }
  console.log('     ✓ Node processes terminated\n');
} catch (err) {
  console.log('     - No Node processes found\n');
}

// Step 2: Kill process on port 3000
console.log('[2/4] Checking port 3000...');
try {
  if (os.platform() === 'win32') {
    execSync(
      'netstat -aon | find "3000" && for /f "tokens=5" %a in (\'netstat -aon | find "3000"\') do taskkill /PID %a /F 2>nul',
      { stdio: 'pipe' }
    );
  } else {
    execSync('lsof -ti :3000 | xargs kill -9 2>/dev/null || true', { stdio: 'pipe' });
  }
  console.log('     ✓ Port 3000 cleared\n');
} catch (err) {
  console.log('     - Port 3000 already free\n');
}

// Step 3: Clean .next folder
console.log('[3/4] Cleaning build cache (.next)...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('     ✓ .next folder cleaned\n');
  } catch (err) {
    console.log('     ⚠ Could not clean .next folder\n');
  }
} else {
  console.log('     - No .next folder to clean\n');
}

// Step 4: Clean node_modules/.cache (if exists)
console.log('[4/4] Cleaning package cache...');
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  try {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('     ✓ Cache cleaned\n');
  } catch (err) {
    console.log('     ⚠ Could not clean cache\n');
  }
} else {
  console.log('     - No cache to clean\n');
}

console.log('========================================');
console.log('  ✅ Cleanup complete!');
console.log('========================================\n');
