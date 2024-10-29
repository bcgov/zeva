const Webpack = require('webpack')
const DevServer = require('webpack-dev-server')
const path = require('path')

const webpackConfig = require('./webpack.config')

const devServerOptions = {
  static: {
    directory: path.join(__dirname, 'public/build'),
    publicPath: '/',
    serveIndex: true,
    watch: {
      ignored: ['node_modules'],
      usePolling: true
    }
  },
  allowedHosts: 'all',
  historyApiFallback: {
    verbose: true,
    index: '/index.html',
    rewrites: [
      {
        from: /\/api/,
        to: '/api'
      }
    ]
  },
  devMiddleware: {
    index: '/index.html',
    publicPath: '/'
  },
  port: 3000,
  hot: false,
  client: false
}

const compiler = Webpack(webpackConfig)
const devServer = new DevServer(devServerOptions, compiler);

(async () => {
  await devServer.start()

  console.log('Running')
})()
