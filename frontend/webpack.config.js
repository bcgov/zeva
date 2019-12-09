const Webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config();

const packageJson = require('./package.json');

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'build');
const mainPath = path.resolve(__dirname, 'src', 'index.js');

const config = {
  mode: 'development',
  entry: {
    bundle: [
      'webpack/hot/dev-server',
      'react-hot-loader/patch',
      '@babel/polyfill',
      mainPath,
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  output: {
    path: buildPath,
    filename: '[name].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: [nodeModulesPath],
      query: {
        presets: ['@babel/preset-react', '@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-object-rest-spread', 'react-hot-loader/babel'],
      },
    }, {
      test: /\.(s?)css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: true,
          reloadAll: true,
        },
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      }],
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: ['file-loader?name=[name].[ext]'],
    }],
  },
  devServer: {
    historyApiFallback: true,
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.DefinePlugin({
      __APIBASE__: 'APIBASE' in process.env ? JSON.stringify(process.env.APIBASE) : "'http://localhost:8000/'",
      __VERSION__: JSON.stringify(packageJson.version),
    }),
    new HtmlWebpackPlugin({
      title: 'ZEVA GRPC Demo',
      chunks: ['bundle', 'vendor'],
      filename: 'generated_index.html',
      inject: false,
      mobile: true,
      appMountId: 'root',
      links: [
        // array of css links to include (eg hosted fonts)
      ],
      // eslint-disable-next-line global-require
      template: require('html-webpack-template'),
    }),
  ],
};

module.exports = config;
