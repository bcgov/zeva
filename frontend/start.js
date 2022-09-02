const Webpack = require('webpack');
const DevServer = require('webpack-dev-server');
const path = require('path');
const http = require('http');

const webpackConfig = require('./webpack.config');
const notifications = require('./notifications');

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
    index: '/generated_index.html',
    rewrites: [
      {
        from: /\/api/,
        to: '/api'
      }
    ]
  },
  devMiddleware: {
    index: '/generated_index.html',
    publicPath: '/'
  },
  client: {
    webSocketURL: {
      hostname: '0.0.0.0',
      pathname: '/',
      port: 5002
    }
  },
  port: 3000,
  hot: true
};

const compiler = Webpack(webpackConfig);
const devServer = new DevServer(devServerOptions, compiler);

const websocketServer = http.createServer((req, res) => {
  res.end();
});

const io = require('socket.io')(websocketServer);

notifications.setup(io);

websocketServer.listen(5002, '0.0.0.0');

(async () => {
  await devServer.start();

  console.log('Running');
})();
