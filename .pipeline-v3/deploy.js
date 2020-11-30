'use strict';
const settings = require('./lib/config.js')
const task = require('./lib/deploy.js')

task(Object.assign(settings, { phase: settings.options.env}));

console.log('real end of deploy')