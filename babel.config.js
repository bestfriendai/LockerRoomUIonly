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
      // Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
    ],
  };
};