module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxRuntime: 'automatic',
        lazyImports: true
      }]
    ],
    plugins: [
      // Module resolver for path aliases (must be before Reanimated)
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': './'
        }
      }],
      // Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
    ],
  };
};