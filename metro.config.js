const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for cjs and mjs file extensions
config.resolver.sourceExts = Array.from(new Set([
  ...config.resolver.sourceExts,
  'cjs',
  'mjs'
]));

// Performance optimizations
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Enable advanced minification for production
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: false,
      wrap_iife: true,
    },
    sourceMap: process.env.NODE_ENV !== 'production',
    toplevel: false,
    warnings: false,
    parse: {
      ecma: 8,
    },
    compress: {
      ecma: 5,
      warnings: false,
      comparisons: false,
      inline: 2,
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: process.env.NODE_ENV === 'production',
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      unsafe_math: true,
      unsafe_methods: true,
    },
  },
};

module.exports = config;