#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Bundle Analysis Script
 * Analyzes the exported bundle to identify optimization opportunities
 */

function analyzeBundle() {
  console.log('🔍 Analyzing bundle size and optimization opportunities...\n');

  // Check if dist directory exists
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ No dist directory found. Run "npx expo export --platform web" first.');
    process.exit(1);
  }

  // Analyze JavaScript bundle
  const jsPath = path.join(distPath, '_expo/static/js/web');
  if (fs.existsSync(jsPath)) {
    const jsFiles = fs.readdirSync(jsPath);
    const entryFile = jsFiles.find(file => file.startsWith('entry-'));
    
    if (entryFile) {
      const filePath = path.join(jsPath, entryFile);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`📦 Main Bundle Size: ${sizeInMB} MB`);
      
      // Provide recommendations based on size
      if (stats.size > 5 * 1024 * 1024) { // > 5MB
        console.log('⚠️  Bundle is quite large. Consider these optimizations:');
        console.log('   • Enable code splitting');
        console.log('   • Lazy load non-critical components');
        console.log('   • Remove unused dependencies');
        console.log('   • Optimize icon libraries');
      } else if (stats.size > 2 * 1024 * 1024) { // > 2MB
        console.log('💡 Bundle size is moderate. Consider:');
        console.log('   • Tree shaking unused code');
        console.log('   • Optimizing images and assets');
      } else {
        console.log('✅ Bundle size is good!');
      }
    }
  }

  // Analyze assets
  const assetsPath = path.join(distPath, '_expo/static/js/web');
  console.log('\n📁 Asset Analysis:');
  
  // Check for large font files
  const fontSizes = [];
  function findFonts(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findFonts(fullPath);
      } else if (item.endsWith('.ttf') || item.endsWith('.woff') || item.endsWith('.woff2')) {
        const sizeInKB = (stat.size / 1024).toFixed(1);
        fontSizes.push({ name: item, size: sizeInKB });
      }
    });
  }

  try {
    findFonts(distPath);
    
    if (fontSizes.length > 0) {
      console.log('   Font files:');
      fontSizes
        .sort((a, b) => parseFloat(b.size) - parseFloat(a.size))
        .slice(0, 5) // Show top 5 largest fonts
        .forEach(font => {
          console.log(`   • ${font.name}: ${font.size} KB`);
        });
      
      const totalFontSize = fontSizes.reduce((sum, font) => sum + parseFloat(font.size), 0);
      console.log(`   Total font size: ${totalFontSize.toFixed(1)} KB`);
      
      if (totalFontSize > 1000) { // > 1MB
        console.log('   💡 Consider using only necessary icon sets');
      }
    }
  } catch (error) {
    console.log('   Could not analyze fonts');
  }

  console.log('\n🚀 Performance Recommendations:');
  console.log('   1. Use React.lazy() for route-based code splitting');
  console.log('   2. Implement image optimization and lazy loading');
  console.log('   3. Use selective imports for icon libraries');
  console.log('   4. Enable Hermes for React Native');
  console.log('   5. Minimize re-renders with React.memo and useMemo');
  console.log('   6. Use FlatList/FlashList for large lists');
  console.log('   7. Implement proper caching strategies');
}

if (require.main === module) {
  analyzeBundle();
}

module.exports = { analyzeBundle };
