const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');

const webpackConfig = require('./webpack.config');

const devServerOptions = {
  contentBase: path.join(__dirname, 'public/build'),
  publicPath: '/',
  index: '/generated_index.html',
  historyApiFallback: {
    verbose: true,
    index: '/generated_index.html'
  },
  port: 5001,
  compress: true,
  public: 'localhost',
  hot: true,
  watchOptions: {
    ignored: ['node_modules'],
    poll: 1500
  }
};

WebpackDevServer.addDevServerEntrypoints(webpackConfig, devServerOptions);
const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(5001, '0.0.0.0', () => {
});
