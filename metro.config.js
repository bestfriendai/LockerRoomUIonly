const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for path aliases
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, '.'),
  'firebase': path.resolve(__dirname, 'node_modules/firebase'),
  'tslib': path.resolve(__dirname, 'node_modules/tslib'),
};

// Ensure these file extensions are supported
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

// Ensure tslib is not treated as an external module
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'tslib': path.resolve(__dirname, 'node_modules/tslib'),
};

module.exports = config;