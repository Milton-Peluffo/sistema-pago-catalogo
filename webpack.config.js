const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: {
    'lambdas/uploadCatalog': './src/lambdas/uploadCatalog.ts',
    'lambdas/getCatalog': './src/lambdas/getCatalog.ts',
  },
  target: 'node',
  externals: [nodeExternals()], // Excluir node_modules del bundle
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
};
