const path = require('path');
const package = require('./package.json');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "production",
  entry: {
    'hexicon': './src/index.mjs',
    'hexicon.min': './src/index.mjs',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    library: `Hexicon`,
    libraryTarget: 'umd',
    libraryExport: "default",
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /min/
      })
    ]
  },
  plugins: [
  ]
};
