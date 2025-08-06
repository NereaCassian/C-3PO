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
        // Copy all files from public except manifest files
        { 
          from: 'public', 
          to: '.',
          globOptions: {
            ignore: ['**/manifest*.json']
          }
        },
        // Copy the correct manifest based on target browser
        {
          from: targetBrowser === 'firefox' ? 'public/manifest-firefox.json' : 'public/manifest.json',
          to: 'manifest.json'
        }
      ],
    }),
  ],
  devtool: 'cheap-module-source-map',
};