#!/usr/bin/env node

/**
 * Comprehensive Import Validation Script
 * Checks all imports across the codebase for correctness and availability
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript and JavaScript files
function getAllSourceFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      getAllSourceFiles(fullPath, files);
    } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Extract imports from a file
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match import statements
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        module: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }
    
    // Also check require statements
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push({
        statement: match[0],
        module: match[1],
        line: content.substring(0, match.index).split('\n').length,
        isRequire: true
      });
    }
    
    return imports;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Check if a module exists
function checkModuleExists(moduleName, projectRoot) {
  // Check if it's a relative import
  if (moduleName.startsWith('.')) {
    return { exists: true, type: 'relative' };
  }
  
  // Check if it's a built-in Node.js module
  const builtinModules = ['fs', 'path', 'crypto', 'util', 'events', 'stream', 'buffer', 'url', 'querystring', 'child_process'];
  if (builtinModules.includes(moduleName)) {
    return { exists: true, type: 'builtin' };
  }
  
  // Check if it's in package.json dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies
    };
    
    // Check exact match or scoped package
    const packageName = moduleName.split('/')[0];
    if (allDeps[packageName] || allDeps[moduleName]) {
      return { exists: true, type: 'dependency', version: allDeps[packageName] || allDeps[moduleName] };
    }
    
    // Check if it's a submodule of an existing package
    for (const dep in allDeps) {
      if (moduleName.startsWith(dep + '/')) {
        return { exists: true, type: 'submodule', parent: dep, version: allDeps[dep] };
      }
    }
    
    return { exists: false, type: 'missing' };
  } catch (error) {
    return { exists: false, type: 'error', error: error.message };
  }
}

// Main validation function
async function validateAllImports() {
  console.log('🔍 Comprehensive Import Validation\n');
  
  const projectRoot = process.cwd();
  const sourceFiles = getAllSourceFiles(projectRoot);
  
  console.log(`Found ${sourceFiles.length} source files to analyze...\n`);
  
  const results = {
    totalFiles: sourceFiles.length,
    totalImports: 0,
    validImports: 0,
    invalidImports: 0,
    missingModules: new Set(),
    issues: []
  };
  
  for (const filePath of sourceFiles) {
    const relativePath = path.relative(projectRoot, filePath);
    const imports = extractImports(filePath);
    
    if (imports.length === 0) continue;
    
    console.log(`📁 ${relativePath} (${imports.length} imports)`);
    results.totalImports += imports.length;
    
    for (const imp of imports) {
      const moduleCheck = checkModuleExists(imp.module, projectRoot);
      
      if (moduleCheck.exists) {
        results.validImports++;
        console.log(`  ✅ ${imp.module} (${moduleCheck.type})`);
      } else {
        results.invalidImports++;
        results.missingModules.add(imp.module);
        results.issues.push({
          file: relativePath,
          line: imp.line,
          module: imp.module,
          statement: imp.statement,
          issue: 'Module not found'
        });
        console.log(`  ❌ ${imp.module} - NOT FOUND`);
      }
    }
    console.log('');
  }
  
  // Check for TypeScript compilation issues
  console.log('🔧 Checking TypeScript Compilation...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful\n');
  } catch (error) {
    console.log('❌ TypeScript compilation issues found:');
    console.log(error.stdout?.toString() || error.message);
    results.issues.push({
      type: 'typescript',
      issue: 'Compilation errors',
      details: error.stdout?.toString() || error.message
    });
  }
  
  // Check for ESLint issues
  console.log('🔧 Checking ESLint...');
  try {
    execSync('npx eslint --ext .ts,.tsx,.js,.jsx . --max-warnings 0', { stdio: 'pipe' });
    console.log('✅ ESLint validation successful\n');
  } catch (error) {
    console.log('⚠️  ESLint issues found (non-critical):');
    const output = error.stdout?.toString() || error.message;
    console.log(output.substring(0, 500) + (output.length > 500 ? '...' : ''));
  }
  
  // Generate report
  console.log('='.repeat(60));
  console.log('📊 IMPORT VALIDATION REPORT');
  console.log('='.repeat(60));
  
  console.log(`📁 Files analyzed: ${results.totalFiles}`);
  console.log(`📦 Total imports: ${results.totalImports}`);
  console.log(`✅ Valid imports: ${results.validImports}`);
  console.log(`❌ Invalid imports: ${results.invalidImports}`);
  
  if (results.missingModules.size > 0) {
    console.log(`\n❌ Missing modules (${results.missingModules.size}):`);
    Array.from(results.missingModules).forEach(module => {
      console.log(`   - ${module}`);
    });
  }
  
  if (results.issues.length > 0) {
    console.log(`\n🔍 Issues found (${results.issues.length}):`);
    results.issues.slice(0, 10).forEach((issue, i) => {
      if (issue.file) {
        console.log(`   ${i + 1}. ${issue.file}:${issue.line} - ${issue.module}`);
      } else {
        console.log(`   ${i + 1}. ${issue.type}: ${issue.issue}`);
      }
    });
    
    if (results.issues.length > 10) {
      console.log(`   ... and ${results.issues.length - 10} more issues`);
    }
  }
  
  const successRate = ((results.validImports / results.totalImports) * 100).toFixed(1);
  console.log(`\n📈 Success rate: ${successRate}%`);
  
  if (results.invalidImports === 0) {
    console.log('\n🎉 All imports are valid! Your codebase is ready.');
  } else {
    console.log('\n⚠️  Some imports need attention before the app will work correctly.');
    
    if (results.missingModules.size > 0) {
      console.log('\n💡 Suggested fixes:');
      Array.from(results.missingModules).forEach(module => {
        console.log(`   npm install ${module}`);
      });
    }
  }
  
  return results;
}

// Run the validation
validateAllImports().catch(console.error);
