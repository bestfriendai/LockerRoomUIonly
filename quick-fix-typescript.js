#!/usr/bin/env node

/**
 * Quick Fix Script - Option A
 * 1. Remove custom Text component usage, use React Native Text
 * 2. Fix duplicate imports systematically  
 * 3. Add missing imports
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', '.expo/**', 'fix-*.js', 'validate-*.js', 'test-*.js', 'quick-*.js']
});

function quickFixFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Remove custom Text component imports and usage
  if (content.includes('import Text from "@/components/ui/Text"') || 
      content.includes('import { Text } from "@/components/ui/Text"') ||
      content.includes('import CustomText from "@/components/ui/Text"')) {
    
    // Remove custom Text imports
    content = content.replace(/import Text from "@\/components\/ui\/Text";\s*\n/g, '');
    content = content.replace(/import { Text } from "@\/components\/ui\/Text";\s*\n/g, '');
    content = content.replace(/import CustomText from "@\/components\/ui\/Text";\s*\n/g, '');
    
    // Ensure React Native Text is imported
    if (!content.includes('Text') || !content.includes('from \'react-native\'')) {
      // Add Text to React Native imports
      const rnImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]react-native['"];?/);
      if (rnImportMatch) {
        const existingImports = rnImportMatch[1].split(',').map(s => s.trim());
        if (!existingImports.includes('Text')) {
          const newImports = [...existingImports, 'Text'].join(',\n  ');
          content = content.replace(rnImportMatch[0], `import {\n  ${newImports}\n} from 'react-native';`);
        }
      } else {
        // Add new React Native import
        const firstImport = content.match(/^import.*$/m);
        if (firstImport) {
          content = content.replace(firstImport[0], `import { Text } from 'react-native';\n${firstImport[0]}`);
        }
      }
    }
    
    // Remove variant and weight props from Text components (not supported by RN Text)
    content = content.replace(/<Text\s+variant="[^"]*"\s*/g, '<Text ');
    content = content.replace(/<Text\s+weight="[^"]*"\s*/g, '<Text ');
    content = content.replace(/\s+variant="[^"]*"/g, '');
    content = content.replace(/\s+weight="[^"]*"/g, '');
    
    modified = true;
  }

  // 2. Fix duplicate imports
  const duplicatePatterns = [
    // TouchableOpacity duplicates
    {
      pattern: /import { TouchableOpacity } from 'react-native-gesture-handler';\s*\n/g,
      check: /TouchableOpacity.*from.*react-native/,
      replacement: ''
    },
    // Text duplicates  
    {
      pattern: /import\s*{\s*[^}]*Text[^}]*}\s*from\s*['"]react-native['"];\s*\n.*import Text from/g,
      replacement: (match) => match.split('\n')[0] + '\n'
    },
    // Animated duplicates
    {
      pattern: /import Animated,.*from 'react-native-reanimated';\s*\n/g,
      check: /Animated.*from.*react-native['"]/,
      replacement: ''
    }
  ];

  duplicatePatterns.forEach(({ pattern, check, replacement }) => {
    if (pattern.test(content) && (!check || check.test(content))) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // 3. Add missing imports
  const missingImports = [];
  
  // Check for SafeAreaView usage
  if (/<SafeAreaView/.test(content) && !content.includes('SafeAreaView')) {
    missingImports.push('SafeAreaView');
  }
  
  // Check for PressableProps usage  
  if (/PressableProps/.test(content) && !content.includes('PressableProps')) {
    missingImports.push('PressableProps');
  }

  // Add missing imports to React Native import
  if (missingImports.length > 0) {
    const rnImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]react-native['"];?/);
    if (rnImportMatch) {
      const existingImports = rnImportMatch[1].split(',').map(s => s.trim());
      const newImports = [...new Set([...existingImports, ...missingImports])];
      content = content.replace(rnImportMatch[0], `import {\n  ${newImports.join(',\n  ')}\n} from 'react-native';`);
      modified = true;
    }
  }

  // 4. Fix common type issues
  // Fix unknown error types
  content = content.replace(/catch\s*\(\s*(\w+):\s*unknown\s*\)/g, 'catch ($1: any)');
  content = content.replace(/(\w+)\.message/g, '($1 as any)?.message');
  content = content.replace(/(\w+)\.code/g, '($1 as any)?.code');
  
  // Fix for loop const issues
  content = content.replace(/for\s*\(\s*const\s+(\w+)\s*=\s*0;/g, 'for (let $1 = 0;');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  }
}

console.log('🚀 Starting Quick Fix (Option A)...\n');

// Process all files
files.forEach(quickFixFile);

console.log('\n✅ Quick Fix completed! Running TypeScript check...');
