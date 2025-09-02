#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'app',
  'components',
  'providers',
  'services',
  'hooks',
  'stores',
  'utils',
  'types'
];

// Common fixes
const fixes = [
  // Remove unused logger imports
  {
    pattern: /^import logger from ['"]\.\.\/utils\/logger['"];?\n/gm,
    replacement: '',
    description: 'Remove unused logger imports'
  },
  {
    pattern: /^import logger from ['"]\.\.\/\.\.\/utils\/logger['"];?\n/gm,
    replacement: '',
    description: 'Remove unused logger imports (nested)'
  },
  {
    pattern: /^import logger from ['"]@\/utils\/logger['"];?\n/gm,
    replacement: '',
    description: 'Remove unused logger imports (alias)'
  },
  
  // Fix unused variables by prefixing with underscore
  {
    pattern: /const (\w+) = .*?; \/\/ eslint-disable-line @typescript-eslint\/no-unused-vars/g,
    replacement: 'const _$1 = $2;',
    description: 'Prefix unused variables with underscore'
  },
  
  // Fix prefer-const issues
  {
    pattern: /let (\w+) = (.*?);(\s*\/\/ This should be const)/gm,
    replacement: 'const $1 = $2;$3',
    description: 'Change let to const for non-reassigned variables'
  }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      const originalContent = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== originalContent) {
        modified = true;
        console.log(`✓ Applied fix: ${fix.description} in ${filePath}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalFixed = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      totalFixed += processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      if (processFile(fullPath)) {
        totalFixed++;
      }
    }
  });
  
  return totalFixed;
}

function main() {
  console.log('🔧 Starting automatic linting fixes...\n');
  
  let totalFixed = 0;
  
  filesToProcess.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      console.log(`📁 Processing ${dir}/...`);
      totalFixed += processDirectory(dirPath);
    }
  });
  
  console.log(`\n✅ Fixed ${totalFixed} files`);
  console.log('🔍 Run "npm run lint" to see remaining issues');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
