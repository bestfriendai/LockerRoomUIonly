#!/usr/bin/env node

/**
 * Fix missing React Native imports that were accidentally removed
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common React Native imports needed
const commonImports = {
  'View': 'react-native',
  'Text': 'react-native', // Only if not using custom Text component
  'StyleSheet': 'react-native',
  'TouchableOpacity': 'react-native',
  'Pressable': 'react-native',
  'ScrollView': 'react-native',
  'FlatList': 'react-native',
  'Alert': 'react-native',
  'Platform': 'react-native',
  'Dimensions': 'react-native',
  'ActivityIndicator': 'react-native',
  'TextInput': 'react-native',
  'KeyboardAvoidingView': 'react-native',
  'Modal': 'react-native',
  'Share': 'react-native',
  'Animated': 'react-native',
  'Easing': 'react-native',
};

const typeImports = {
  'ViewStyle': 'react-native',
  'PressableProps': 'react-native',
};

function fixImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check what's missing and used in the file
  const missingImports = [];
  const missingTypes = [];

  // Check for missing regular imports
  Object.keys(commonImports).forEach(component => {
    const isUsed = new RegExp(`<${component}[\\s>]|${component}\\.|${component}\\(`).test(content);
    const isImported = new RegExp(`import.*${component}.*from.*['"]react-native['"]`).test(content);
    
    if (isUsed && !isImported) {
      // Special case for Text - check if custom Text is imported
      if (component === 'Text' && content.includes("import Text from '@/components/ui/Text'")) {
        return; // Skip, using custom Text component
      }
      missingImports.push(component);
    }
  });

  // Check for missing type imports
  Object.keys(typeImports).forEach(type => {
    const isUsed = new RegExp(`:\\s*${type}[\\s<>|;,)]`).test(content);
    const isImported = new RegExp(`import.*${type}.*from.*['"]react-native['"]`).test(content);
    
    if (isUsed && !isImported) {
      missingTypes.push(type);
    }
  });

  if (missingImports.length === 0 && missingTypes.length === 0) {
    return; // Nothing to fix
  }

  // Find existing react-native import
  const reactNativeImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]react-native['"];?/);
  
  if (reactNativeImportMatch) {
    // Add to existing import
    const existingImports = reactNativeImportMatch[1].split(',').map(s => s.trim());
    const allImports = [...new Set([...existingImports, ...missingImports, ...missingTypes])];
    const newImportLine = `import {\n  ${allImports.join(',\n  ')}\n} from 'react-native';`;
    
    content = content.replace(reactNativeImportMatch[0], newImportLine);
    modified = true;
  } else {
    // Add new import at the top
    const allImports = [...missingImports, ...missingTypes];
    if (allImports.length > 0) {
      const newImportLine = `import {\n  ${allImports.join(',\n  ')}\n} from 'react-native';\n`;
      
      // Find the best place to insert (after React import if exists)
      const reactImportMatch = content.match(/import\s+React[^;]*;/);
      if (reactImportMatch) {
        const insertIndex = content.indexOf(reactImportMatch[0]) + reactImportMatch[0].length;
        content = content.slice(0, insertIndex) + '\n' + newImportLine + content.slice(insertIndex);
      } else {
        content = newImportLine + content;
      }
      modified = true;
    }
  }

  // Fix common type errors
  if (content.includes(': any') && filePath.endsWith('.tsx')) {
    // Fix pressed parameter type
    content = content.replace(/\(\{\s*pressed\s*\}\s*:\s*any\)/g, '({ pressed }: { pressed: boolean })');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
  }
}

// Find all TypeScript/JavaScript files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', '.expo/**', 'fix-*.js', 'validate-*.js', 'test-*.js']
});

// Process all files
files.forEach(fixImportsInFile);

console.log('Import fixes completed');
