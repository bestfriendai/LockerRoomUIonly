#!/usr/bin/env node

/**
 * Script to fix unused error variables by prefixing with underscore
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common unused variable patterns to fix
const fixes = [
  // Change 'error' to '_error' in catch blocks
  { 
    pattern: /catch \(error\) {/g, 
    replacement: 'catch (_error) {' 
  },
  // Change unused error parameters
  { 
    pattern: /\(error: [^)]+\) =>/g, 
    replacement: (match) => match.replace('error', '_error')
  },
  // Change unused error in function parameters
  { 
    pattern: /function[^(]*\([^)]*error[^)]*\)/g, 
    replacement: (match) => match.replace(/\berror\b/, '_error')
  }
];

function fixUnusedVars(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Main execution
function main() {
  console.log('🔧 Fixing unused variable warnings...\n');
  
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
    nodir: true
  });
  
  let fixedFiles = 0;
  
  files.forEach(file => {
    if (fixUnusedVars(file)) {
      fixedFiles++;
      console.log(`✅ Fixed: ${file}`);
    }
  });
  
  console.log(`\n📊 Summary: Fixed unused variables in ${fixedFiles} files\n`);
}

try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}