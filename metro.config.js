const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for path aliases
config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
  'firebase': path.resolve(__dirname, 'node_modules/firebase'),
};

// Ensure these file extensions are supported
config.resolver.sourceExts.push('cjs');

module.exports = config;