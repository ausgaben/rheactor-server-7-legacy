'use strict'

let request = require('supertest')
let Promise = require('bluebird')
Promise.promisifyAll(request)

let backend = require('../backend')

exports.clearDb = function () {
  return backend.redis.client.flushdb()
}

exports.redis = backend.redis.client
exports.repositories = backend.repositories

// Configure parsing for superagent
require('superagent').serialize[backend.config.get('mime_type')] = JSON.stringify
