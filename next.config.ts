import type { NextConfig } from "next";
import path from 'path';

/**
 * Next.js configuration with support for React Native Web and font files
 */
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle font files using webpack 5 asset modules
    config.module.rules.push({
      test: /\.(ttf|woff|woff2|eot)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]',
      },
    });

    // Resolve .web.js extensions for React Native Web
    config.resolve.extensions = [
      '.web.js', '.web.jsx', '.web.ts', '.web.tsx',
      ...config.resolve.extensions || ['.js', '.jsx', '.ts', '.tsx']
    ];

    // Configure aliases to use React Native Web
    config.resolve.alias = {
      ...config.resolve.alias,
      // Replace react-native with react-native-web
      'react-native$': 'react-native-web',
      'react-native/Libraries/Components/View/ViewPropTypes': 'react-native-web/dist/exports/ViewPropTypes',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter': 'react-native-web/dist/vendor/react-native/NativeEventEmitter',
      // Handle Expo vector icons
      '@expo/vector-icons': path.resolve(__dirname, './src/utils/empty-module.js'),
    };

    // Exclude react-native from being processed by webpack
    config.externals = config.externals || {};
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
