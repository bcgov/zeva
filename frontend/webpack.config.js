const Webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SriPlugin = require('webpack-subresource-integrity');
require('dotenv').config();

const packageJson = require('./package.json');

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'build');
const mainPath = path.resolve(__dirname, 'src', 'index.js');

const config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
    crossOriginLoading: 'anonymous',
    filename: '[name].js',
    path: buildPath,
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
    }, {
      test: /\.(otf|eot|svg|ttf|woff|woff2)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      }],
    }],
  },
  devServer: {
    historyApiFallback: true,
  },
  devtool: 'source-map',
  plugins: [
    new SriPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: process.env.NODE_ENV === 'production',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.DefinePlugin({
      __APIBASE__: 'APIBASE' in process.env
        ? JSON.stringify(process.env.APIBASE)
        : "'http://localhost/api/'",
      __KEYCLOAK_CLIENT_ID__: 'KEYCLOAK_CLIENT_ID' in process.env
        ? JSON.stringify(process.env.KEYCLOAK_CLIENT_ID)
        : "'zeva-app'",
      __KEYCLOAK_LOGOUT_REDIRECT_URL__: 'KEYCLOAK_LOGOUT_REDIRECT_URL' in process.env
        ? JSON.stringify(process.env.KEYCLOAK_LOGOUT_REDIRECT_URL)
        : "'http://localhost/'",
      __KEYCLOAK_REALM_NAME__: 'KEYCLOAK_REALM_NAME' in process.env
        ? JSON.stringify(process.env.KEYCLOAK_REALM_NAME)
        : "'zeva'",
      __KEYCLOAK_URL__: 'KEYCLOAK_URL' in process.env
        ? JSON.stringify(process.env.KEYCLOAK_URL)
        : "'http://localhost:8888/auth'",
      __VERSION__: JSON.stringify(packageJson.version),
    }),
    new HtmlWebpackPlugin({
      title: 'ZEVA',
      chunks: ['bundle', 'vendor'],
      filename: 'generated_index.html',
      inject: false,
      mobile: true,
      appMountId: 'root',
      links: [
        'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
        // array of css links to include (eg hosted fonts)
      ],
      // eslint-disable-next-line global-require
      template: require('html-webpack-template'),
    }),
  ],
};

module.exports = config;
