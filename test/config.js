'use strict'

let nconf = require('nconf')
let path = require('path')

nconf.use('memory')

let host = 'localhost'
let port = 8080

// Set defaults
nconf.defaults({
  'environment': 'testing',
  'mime_type': 'application/vnd.resourceful-humans.rheactor.v1+json',
  'port': port,
  'host': host,
  'api_host': 'http://' + host + ':' + port,
  'web_host': 'http://' + host + ':' + port,
  'base_href': '/',
  'deployVersion': +new Date(),
  'app': process.env.npm_package_name,
  'root': path.normalize(path.join(__dirname, '/../..')),
  'token_lifetime': 1800,
  'activation_token_lifetime': 60 * 60 * 24 * 30,
  'redis': {
    'host': '127.0.0.1',
    'port': 6379,
    'database': 0,
    'password': null
  },
  'private_key': null,
  'public_key': null,
  'bcrypt_rounds': 14,
  'template_mailer': {
    'smtp_config': 'server'
  }
})

module.exports = nconf
