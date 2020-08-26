const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/src/index.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../dist/client'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: [{
          loader: "ts-loader",
          options: {
            configFile: "tsconfig.json"
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  devtool: 'inline-source-map',
  plugins: [new HtmlWebpackPlugin({
    template: 'client/src/index.html'
  })]
};
