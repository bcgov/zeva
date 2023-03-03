const Webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const EncodingPlugin = require('webpack-encoding-plugin')
require('dotenv').config()

const packageJson = require('./package.json')

const nodeModulesPath = path.resolve(__dirname, 'node_modules')
const buildPath = path.resolve(__dirname, 'public', 'build')
const mainPath = path.resolve(__dirname, 'src', 'index.js')

console.log('Building for ' + (process.env.NODE_ENV ? 'Production' : 'Development'))

const config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    bundle: process.env.NODE_ENV === 'production'
      ? ['@babel/polyfill', mainPath]
      : [
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
    new CopyWebpackPlugin(
      process.env.NODE_ENV === 'production'
        ? { patterns: [{ from: 'static' }] }
        : {
            patterns: [
              { from: 'static' },
              { from: 'public/config/', to: 'opt/app-root/src/app/config/' } // add local dev config
            ]
          }
    ),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version)
    }),
    new HtmlWebpackPlugin({
      title: 'ZEVA',
      chunks: ['bundle', 'vendor'],
      filename: 'index.html',
      inject: true,
      favicon: './favicon.ico',
      template: './template.html'
    }),
    new EncodingPlugin({
      encoding: 'utf8'
    })
  ]
}

module.exports = config
