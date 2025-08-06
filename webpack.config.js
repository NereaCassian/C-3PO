const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Detect target browser from environment variable
const targetBrowser = process.env.TARGET_BROWSER || 'chrome';
console.log(`🎯 Building for ${targetBrowser}`);

module.exports = {
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/background.ts',
    'content-script': './src/content-script/content-script.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        // Copy all files from public except manifest files and icons (we'll handle icons separately)
        { 
          from: 'public', 
          to: '.',
          globOptions: {
            ignore: ['**/manifest*.json', '**/icons/icon1*.svg', '**/icons/icon3*.svg', '**/icons/icon4*.svg', '**/icons/icon12*.svg']
          }
        },
        // Copy the correct manifest based on target browser
        {
          from: targetBrowser === 'firefox' ? 'public/manifest-firefox.json' : 'public/manifest.json',
          to: 'manifest.json'
        },
        // Copy icons: SVG for Firefox, PNG for Chrome (if available, fallback to SVG)
        ...(targetBrowser === 'firefox' ? [
          // Firefox: Use SVG icons
          { from: 'public/icons/icon16.svg', to: 'icons/icon16.svg' },
          { from: 'public/icons/icon32.svg', to: 'icons/icon32.svg' },
          { from: 'public/icons/icon48.svg', to: 'icons/icon48.svg' },
          { from: 'public/icons/icon128.svg', to: 'icons/icon128.svg' }
        ] : [
          // Chrome: Try PNG first, fallback to SVG-as-PNG
          { 
            from: 'public/icons/icon16.png', 
            to: 'icons/icon16.png',
            noErrorOnMissing: true 
          },
          { 
            from: 'public/icons/icon32.png', 
            to: 'icons/icon32.png',
            noErrorOnMissing: true 
          },
          { 
            from: 'public/icons/icon48.png', 
            to: 'icons/icon48.png',
            noErrorOnMissing: true 
          },
          { 
            from: 'public/icons/icon128.png', 
            to: 'icons/icon128.png',
            noErrorOnMissing: true 
          }
        ])
      ],
    }),
  ],
  devtool: 'cheap-module-source-map',
};