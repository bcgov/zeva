const Webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const CopyWebpackPlugin = require('copy-webpack-plugin');
require('dotenv').config();

const packageJson = require('./package.json');

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'build');
const mainPath = path.resolve(__dirname, 'src', 'index.js');

const config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    bundle: [
      // Runtime code for hot module replacement
      'webpack/hot/dev-server',
      // Dev server client for web socket transport, hot and live reload logic
      'webpack-dev-server/client/index.js?hot=true&live-reload=true',
      '@babel/polyfill',
      mainPath
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  output: {
    crossOriginLoading: 'anonymous',
    filename: '[name].js',
    path: buildPath,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [nodeModulesPath],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-object-rest-spread',
              'react-hot-loader/babel'
            ]
          }
        }
      },
      {
        test: /\.(s?)css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ['file-loader?name=[name].[ext]']
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    new SubresourceIntegrityPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: process.env.NODE_ENV === 'production'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static'
        }
      ]
    }),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.DefinePlugin({
      __APIBASE__:
        'APIBASE' in process.env
          ? JSON.stringify(process.env.APIBASE)
          : "'http://localhost/api/'",
      __KEYCLOAK_CLIENT_ID__:
        'KEYCLOAK_CLIENT_ID' in process.env
          ? JSON.stringify(process.env.KEYCLOAK_CLIENT_ID)
          : "'zeva-app'",
      __KEYCLOAK_LOGOUT_REDIRECT_URL__:
        'KEYCLOAK_LOGOUT_REDIRECT_URL' in process.env
          ? JSON.stringify(process.env.KEYCLOAK_LOGOUT_REDIRECT_URL)
          : "'http://localhost/'",
      __KEYCLOAK_CALLBACK_URL__:
        'KEYCLOAK_CALLBACK_URL' in process.env
          ? JSON.stringify(process.env.KEYCLOAK_CALLBACK_URL)
          : "'http://localhost/'",
      __KEYCLOAK_REALM_NAME__:
        'KEYCLOAK_REALM_NAME' in process.env
          ? JSON.stringify(process.env.KEYCLOAK_REALM_NAME)
          : "'zeva'",
      __KEYCLOAK_URL__:
        'KEYCLOAK_URL' in process.env
          ? JSON.stringify(process.env.KEYCLOAK_URL)
          : "'http://localhost:8888/auth'",
      __VERSION__: JSON.stringify(packageJson.version)
    }),
    new HtmlWebpackPlugin({
      title: 'ZEVA',
      chunks: ['bundle', 'vendor'],
      filename: 'generated_index.html',
      inject: true,
      favicon: './favicon.ico',
      template: './template.html'
    })
  ]
};

module.exports = config;
