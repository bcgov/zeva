const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const http = require('http');

const webpackConfig = require('./webpack.config');
const notifications = require('./notifications');

const devServerOptions = {
  contentBase: path.join(__dirname, 'public/build'),
  publicPath: '/',
  index: '/generated_index.html',
  disableHostCheck: true,
  historyApiFallback: {
    verbose: true,
    index: '/generated_index.html',
  },
  port: 5001,
  compress: true,
  public: 'localhost',
  hot: true,
  watchOptions: {
    ignored: ['node_modules'],
    poll: 1500,
  },
};

WebpackDevServer.addDevServerEntrypoints(webpackConfig, devServerOptions);
const compiler = Webpack(webpackConfig);
const devServer = new WebpackDevServer(compiler, devServerOptions);


const websocketServer = http.createServer((req, res) => {
  res.end();
});

const io = require('socket.io')(websocketServer);

notifications.setup(io);

websocketServer.listen(5002, '0.0.0.0');


devServer.listen(5001, '0.0.0.0', () => {
});
