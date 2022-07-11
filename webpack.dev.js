const path = require('path');
const package = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval',
  entry: './src/index.mjs',
  output: {
    filename: `${package.name}.js`,
    path: path.resolve(__dirname, 'build'),
    library: `Hexicon`,
    libraryTarget: 'umd',
    libraryExport: 'default',
    clean: true
  },
  devServer: {
    open: true,
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './test/demo.html'
    })
  ]
};
