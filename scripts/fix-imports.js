#!/usr/bin/env node

/**
 * Script to fix malformed import statements
 * Usage: node scripts/fix-imports.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix malformed logger imports
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix malformed logger import pattern
  const malformedPattern = /import \{\nimport logger from '([^']+)';\n(\s*)([^}]+)\n\} from 'react-native';/gm;
  
  if (malformedPattern.test(content)) {
    content = content.replace(malformedPattern, (match, loggerPath, spacing, reactNativeImports) => {
      modified = true;
      return `import {\n${spacing}${reactNativeImports}\n} from 'react-native';\nimport logger from '${loggerPath}';`;
    });
  }
  
  // Fix other common malformed patterns
  const patterns = [
    {
      // Fix "import {\nimport X from 'path';" pattern
      regex: /import \{\nimport ([^}]+) from '([^']+)';\n(\s*)([^}]*)\n\}/gm,
      replacement: (match, importName, importPath, spacing, restOfImports) => {
        modified = true;
        const cleanRestOfImports = restOfImports.trim();
        if (cleanRestOfImports) {
          return `import {\n${spacing}${cleanRestOfImports}\n}\nimport ${importName} from '${importPath}';`;
        } else {
          return `import ${importName} from '${importPath}';`;
        }
      }
    }
  ];
  
  patterns.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
function main() {
  console.log('🔧 Fixing malformed import statements...\n');
  
  const files = glob.sync('{app,components,providers,services,stores,hooks}/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
    nodir: true
  });
  
  let fixedFiles = 0;
  
  files.forEach(file => {
    if (fixImports(file)) {
      fixedFiles++;
      console.log(`✅ Fixed: ${file}`);
    }
  });
  
  console.log(`\n📊 Summary: Fixed ${fixedFiles} files with malformed imports\n`);
}

try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}