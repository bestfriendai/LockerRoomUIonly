const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for path aliases
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, '.'),
  'firebase': path.resolve(__dirname, 'node_modules/firebase'),
  // Ensure tslib resolves to its CommonJS build to avoid interop issues
  'tslib': require.resolve('tslib/tslib.js'),
};

// Ensure these file extensions are supported
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

module.exports = config;