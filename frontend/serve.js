const http = require('http');
const express = require('express');
const fallback = require('express-history-api-fallback');
const notifications = require('./notifications');
const morgan = require('morgan');

const websocketServer = http.createServer((req, res) => {
  res.end();
});

const io = require('socket.io')(websocketServer);

notifications.setup(io);
websocketServer.listen(5002, '0.0.0.0');

const unless = (path, middleware) => (
  (req, res, next) => {
    if (req.originalUrl.indexOf(path) === 0) {
      return next();
    }

    return middleware(req, res, next);
  }
);

const app = express();
app.use(unless('/api', morgan('combined')));

const root = `${__dirname}/public/build`;
app.use(express.static(root));
app.use(fallback('generated_index.html', { root }));

app.listen(3000);
