'use strict'

let backend = require('./backend')
let config = backend.config
let redis = backend.redis.client
let repositories = backend.repositories
let emitter = backend.emitter

// HTTP API
let express = require('express')
let app = express()
app.set('env', 'test') // Suppress errors logged from express.js
require('../config/express')(app, config, repositories, emitter)
let port = config.get('port')
let host = config.get('host')
app.listen(port, host)
console.log('Web:', config.get('web_host') + config.get('base_href'))
console.log('API:', config.get('api_host'))
module.exports = {
  app,
  repositories,
  redis,
  config,
  emitter
}
