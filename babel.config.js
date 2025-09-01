module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for the optional chaining operator
      '@babel/plugin-proposal-optional-chaining',
      // Required for the nullish coalescing operator
      '@babel/plugin-proposal-nullish-coalescing-operator',
      // Required for class properties
      '@babel/plugin-proposal-class-properties',
      // Required for decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Reanimated plugin
      'react-native-reanimated/plugin',
    ],
  };
};