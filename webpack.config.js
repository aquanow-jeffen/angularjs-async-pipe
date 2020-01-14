'use strict';
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
	entry: {
    'index': './src/index.ts',
    'index.min': './src/index.ts'
  },
	output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    libraryTarget: 'umd2',
    library: 'angularjs-async-filter',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  target: "web",
  optimization: {
    minimizer: [new UglifyJsPlugin({
      test: /\.min\.js(\?.*)?$/i,
      sourceMap: true
    })]
  },
  module: {
      rules: [
          {
              test: /\.tsx?$/,
              exclude: /node_modules/,
              loader: 'ts-loader'
          }
      ]
  },
  resolve: {
      extensions: [ '.ts', '.tsx', '.js' ]
  },
  externals: {
    angular: 'angular'
  }
};