#!/usr/bin/env node

/**
 * Script to replace console.log statements with production logger
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to process
const targetDirs = [
  'app',
  'components',
  'providers',
  'services',
  'stores',
  'hooks'
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/scripts/**',
  '**/utils/logger.ts'
];

// Console methods to replace
const consoleMethods = {
  'console.log': 'logger.debug',
  'console.info': 'logger.info',
  'console.warn': 'logger.warn',
  'console.error': 'logger.error'
};

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let needsImport = false;
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes('from \'../utils/logger\'') || 
                          content.includes('from \'../../utils/logger\'') || 
                          content.includes('from \'@/utils/logger\'');
  
  // Replace console statements
  for (const [consoleMethod, loggerMethod] of Object.entries(consoleMethods)) {
    const regex = new RegExp(`\\b${consoleMethod.replace('.', '\\.')}\\(`, 'g');
    if (regex.test(content)) {
      // Wrap console statements in __DEV__ check instead of replacing
      const devCheckRegex = new RegExp(
        `(?<!if \\(__DEV__\\) )${consoleMethod.replace('.', '\\.')}\\(`,
        'g'
      );
      
      content = content.replace(devCheckRegex, (match) => {
        modified = true;
        if (!hasLoggerImport && loggerMethod.includes('logger')) {
          needsImport = true;
        }
        
        // For development, keep console.log but wrap in __DEV__ check
        return `__DEV__ && ${match}`;
      });
    }
  }
  
  // Add logger import if needed
  if (needsImport && !hasLoggerImport) {
    // Calculate relative path to logger
    const fileDir = path.dirname(filePath);
    const loggerPath = path.join(__dirname, '..', 'utils', 'logger');
    let relativePath = path.relative(fileDir, loggerPath);
    
    // Ensure path starts with ./ or ../
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Replace backslashes with forward slashes for consistency
    relativePath = relativePath.replace(/\\/g, '/');
    
    // Add import statement after existing imports
    const importRegex = /^(import .+;?\n)+/m;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match) => {
        return match + `import logger from '${relativePath}';\n`;
      });
    } else {
      // Add at the beginning if no imports found
      content = `import logger from '${relativePath}';\n\n${content}`;
    }
  }
  
  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
function main() {
  console.log('🔍 Scanning for console.log statements...\n');
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  targetDirs.forEach(dir => {
    const pattern = path.join(dir, '**/*.{ts,tsx,js,jsx}');
    const files = glob.sync(pattern, { 
      ignore: excludePatterns,
      nodir: true 
    });
    
    files.forEach(file => {
      totalFiles++;
      if (processFile(file)) {
        modifiedFiles++;
        console.log(`✅ Modified: ${file}`);
      }
    });
  });
  
  console.log('\n📊 Summary:');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log('\n✨ Console.log replacement complete!');
  console.log('Note: Console statements are now wrapped in __DEV__ checks.');
  console.log('They will only run in development mode.\n');
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}