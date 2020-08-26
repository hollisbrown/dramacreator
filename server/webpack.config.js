const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server/src/index.js',
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../dist/server'),
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
  externals: [ nodeExternals() ],
  devtool: 'inline-source-map'
};
