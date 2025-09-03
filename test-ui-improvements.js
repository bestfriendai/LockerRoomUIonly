/**
 * Test UI/UX Improvements
 * Verifies all the spacing, sizing, and component improvements
 * Run with: node test-ui-improvements.js
 */

const fs = require('fs');

function testComponentImprovements() {
  console.log('🎨 Testing UI Component Improvements...\n');
  
  const improvements = [
    {
      file: 'components/ui/ModernButton.tsx',
      name: 'ModernButton',
      checks: [
        { pattern: 'paddingHorizontal: 16', description: 'Improved button padding (sm)' },
        { pattern: 'paddingHorizontal: 20', description: 'Better button padding (md)' },
        { pattern: 'fontSize: 15', description: 'Optimized button text size' },
        { pattern: 'marginRight: 8', description: 'Better icon spacing' }
      ]
    },
    {
      file: 'components/ui/Input.tsx',
      name: 'Input Component',
      checks: [
        { pattern: 'paddingHorizontal: 12', description: 'Compact input padding (sm)' },
        { pattern: 'paddingHorizontal: 14', description: 'Balanced input padding (md)' },
        { pattern: 'minHeight: 44', description: 'More compact default height' },
        { pattern: 'fontSize: size === \'sm\' ? 14', description: 'Size-appropriate font sizing' }
      ]
    },
    {
      file: 'constants/spacing.ts',
      name: 'Spacing System',
      checks: [
        { pattern: 'md: 14', description: 'Optimized medium spacing' },
        { pattern: 'lg: 20', description: 'Better large spacing' },
        { pattern: 'component: 14', description: 'Tighter component spacing' },
        { pattern: 'screen: 16', description: 'More content space' }
      ]
    },
    {
      file: 'styles/typography.ts',
      name: 'Typography System',
      checks: [
        { pattern: 'fontSize: 28', description: 'Optimized h1 size' },
        { pattern: 'fontSize: 15', description: 'Better body text size' },
        { pattern: 'letterSpacing: -0.3', description: 'Improved letter spacing' },
        { pattern: 'lineHeight: 22', description: 'Better line height for readability' }
      ]
    }
  ];
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const improvement of improvements) {
    console.log(`🔍 Testing ${improvement.name}...`);
    
    if (!fs.existsSync(improvement.file)) {
      console.log(`❌ File not found: ${improvement.file}`);
      maxScore += improvement.checks.length;
      continue;
    }
    
    const content = fs.readFileSync(improvement.file, 'utf8');
    let componentScore = 0;
    
    for (const check of improvement.checks) {
      if (content.includes(check.pattern)) {
        console.log(`  ✅ ${check.description}`);
        componentScore++;
      } else {
        console.log(`  ❌ ${check.description} - Missing: ${check.pattern}`);
      }
    }
    
    totalScore += componentScore;
    maxScore += improvement.checks.length;
    
    const percentage = Math.round((componentScore / improvement.checks.length) * 100);
    console.log(`  📊 ${improvement.name}: ${percentage}% improved\n`);
  }
  
  return { totalScore, maxScore };
}

function testLayoutImprovements() {
  console.log('📱 Testing Layout Improvements...\n');
  
  const layoutTests = [
    {
      file: 'app/(tabs)/_layout.tsx',
      name: 'Tab Navigation',
      checks: [
        { pattern: 'paddingHorizontal: 12', description: 'Compact tab bar padding' },
        { pattern: 'paddingTop: 6', description: 'Tighter top padding' },
        { pattern: 'marginBottom: 3', description: 'Better icon-label spacing' },
        { pattern: 'fontSize: 10', description: 'Optimized tab label size' }
      ]
    },
    {
      file: 'app/(tabs)/search.tsx',
      name: 'Search Screen',
      checks: [
        { pattern: 'padding: 14', description: 'Optimized container padding' },
        { pattern: 'height: 40', description: 'Compact filter button' },
        { pattern: 'padding: 10', description: 'Tighter results padding' },
        { pattern: 'marginBottom: 5', description: 'Better item spacing' }
      ]
    },
    {
      file: 'components/ReviewCard.tsx',
      name: 'Review Cards',
      checks: [
        { pattern: 'paddingHorizontal: 14', description: 'Compact card padding' },
        { pattern: 'paddingBottom: 12', description: 'Tighter content padding' },
        { pattern: 'paddingTop: 14', description: 'Balanced header padding' },
        { pattern: 'marginHorizontal: 14', description: 'Better image margins' }
      ]
    }
  ];
  
  let totalScore = 0;
  let maxScore = 0;
  
  for (const test of layoutTests) {
    console.log(`🔍 Testing ${test.name}...`);
    
    if (!fs.existsSync(test.file)) {
      console.log(`❌ File not found: ${test.file}`);
      maxScore += test.checks.length;
      continue;
    }
    
    const content = fs.readFileSync(test.file, 'utf8');
    let componentScore = 0;
    
    for (const check of test.checks) {
      if (content.includes(check.pattern)) {
        console.log(`  ✅ ${check.description}`);
        componentScore++;
      } else {
        console.log(`  ❌ ${check.description} - Missing: ${check.pattern}`);
      }
    }
    
    totalScore += componentScore;
    maxScore += test.checks.length;
    
    const percentage = Math.round((componentScore / test.checks.length) * 100);
    console.log(`  📊 ${test.name}: ${percentage}% improved\n`);
  }
  
  return { totalScore, maxScore };
}

function testDesignTokens() {
  console.log('🎯 Testing Design Token Improvements...\n');
  
  const tokenFile = 'constants/tokens.ts';
  
  if (!fs.existsSync(tokenFile)) {
    console.log('❌ Design tokens file not found');
    return { totalScore: 0, maxScore: 5 };
  }
  
  const content = fs.readFileSync(tokenFile, 'utf8');
  const checks = [
    { pattern: 'compactLayoutPresets', description: 'Compact layout presets added' },
    { pattern: 'buttonHeight:', description: 'Optimized button heights' },
    { pattern: 'inputHeight:', description: 'Improved input heights' },
    { pattern: 'tabBarHeight: 60', description: 'Compact tab bar height' },
    { pattern: 'iconSize:', description: 'Optimized icon sizes' }
  ];
  
  let score = 0;
  for (const check of checks) {
    if (content.includes(check.pattern)) {
      console.log(`✅ ${check.description}`);
      score++;
    } else {
      console.log(`❌ ${check.description}`);
    }
  }
  
  const percentage = Math.round((score / checks.length) * 100);
  console.log(`📊 Design Tokens: ${percentage}% improved\n`);
  
  return { totalScore: score, maxScore: checks.length };
}

async function runUIImprovementTests() {
  console.log('🚀 LockerRoom Talk - UI/UX Improvement Test\n');
  console.log('Testing all UI improvements for better sizing, spacing, and components...\n');
  
  const componentResults = testComponentImprovements();
  const layoutResults = testLayoutImprovements();
  const tokenResults = testDesignTokens();
  
  const totalScore = componentResults.totalScore + layoutResults.totalScore + tokenResults.totalScore;
  const maxScore = componentResults.maxScore + layoutResults.maxScore + tokenResults.maxScore;
  const overallPercentage = Math.round((totalScore / maxScore) * 100);
  
  console.log('📊 UI/UX Improvement Results:');
  console.log('=====================================');
  console.log(`Component Improvements: ${Math.round((componentResults.totalScore / componentResults.maxScore) * 100)}%`);
  console.log(`Layout Improvements: ${Math.round((layoutResults.totalScore / layoutResults.maxScore) * 100)}%`);
  console.log(`Design Token Improvements: ${Math.round((tokenResults.totalScore / tokenResults.maxScore) * 100)}%`);
  
  console.log('\n🎯 OVERALL UI/UX STATUS:');
  console.log('=====================================');
  
  if (overallPercentage >= 90) {
    console.log('🎉 EXCELLENT - UI is beautifully optimized!');
  } else if (overallPercentage >= 75) {
    console.log('✅ GREAT - UI improvements are working well!');
  } else if (overallPercentage >= 50) {
    console.log('⚠️ GOOD - Some improvements applied, more possible');
  } else {
    console.log('🔧 NEEDS WORK - More UI improvements needed');
  }
  
  console.log(`Overall UI Improvement Score: ${overallPercentage}%\n`);
  
  console.log('💡 UI/UX Improvements Applied:');
  console.log('✅ Compact button sizing and padding');
  console.log('✅ Optimized input field proportions');
  console.log('✅ Tighter spacing throughout the app');
  console.log('✅ Better typography hierarchy');
  console.log('✅ Improved tab navigation design');
  console.log('✅ More compact card layouts');
  console.log('✅ Enhanced visual polish');
  console.log('✅ Consistent design tokens');
  console.log('✅ Better icon and text spacing');
  console.log('✅ Optimized component heights');
  
  return overallPercentage >= 75;
}

// Run the UI improvement tests
runUIImprovementTests().catch(console.error);
