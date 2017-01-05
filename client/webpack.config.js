const webpack = require('webpack');
const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');

var plugins = [
  new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
  new webpack.DefinePlugin({
    'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') }
  })
];

var config = {
  devtool: '',
  entry: {
    app: './app/main',
    vendor: [
      'react',
      'react-dom',
      'react-router',
      'redux',
      'react-redux',
      'redux-saga'
    ]
  },
  output: {
    path: path.resolve(__dirname, '../static/js'),
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        include: /app/,
        loaders: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[local]___[hash:base64:5]',
          'postcss-loader'
        ]
      },
      {
        test: /\.css$/,
        exclude: /app/,
        loader: 'style!css'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['', '.js']
  }
};


if (process.env.NODE_ENV !== 'production') {
  console.log('development build');
  plugins.unshift(new LiveReloadPlugin({ appendScriptTag: true }));
  config.plugins = plugins;
  config.devtool = 'module-source-map';
} else {
  plugins.unshift(new webpack.optimize.OccurenceOrderPlugin(), new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    comments: false,
    mangle: true,
    minimize: true
  }), new webpack.optimize.AggressiveMergingPlugin());

  config.plugins = plugins;
}

module.exports = config;
