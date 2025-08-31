#!/usr/bin/env node

/**
 * Fix console.log statements to be guarded with __DEV__
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', 'dist/**', '.expo/**', 'fix-*.js', 'validate-*.js', 'test-*.js']
});

function fixConsoleLogsInFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match console.log statements that aren't already guarded
  const consoleLogPattern = /^(\s*)(console\.(log|warn|error|info|debug)\([^)]*\);?)$/gm;
  
  content = content.replace(consoleLogPattern, (match, indent, consoleStatement) => {
    // Skip if already guarded
    if (content.includes('if (__DEV__)') && 
        content.indexOf('if (__DEV__)') < content.indexOf(match)) {
      return match;
    }
    
    // Skip if it's a Sentry-related console.warn
    if (consoleStatement.includes('Sentry') || consoleStatement.includes('sentryError')) {
      return match;
    }
    
    modified = true;
    return `${indent}if (__DEV__) {\n${indent}  ${consoleStatement}\n${indent}}`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed console logs in ${filePath}`);
  }
}

// Process all files
files.forEach(fixConsoleLogsInFile);

console.log('Console.log fixes completed');
