'use strict'

const Promise = require('bluebird')
Promise.longStackTraces()
const EntryNotFoundError = require('rheactor-value-objects/errors/entry-not-found')
const EntryAlreadyExistsError = require('rheactor-value-objects/errors/entry-already-exists')
const config = require('./config')

// Event listening
const emitter = require('../services/emitter')
emitter.on('error', (err) => {
  if (EntryNotFoundError.is(err) || EntryAlreadyExistsError.is(err)) {
    return
  }
  throw err
})

// Persistence
const RedisConnection = require('../services/redis-connection')
const redis = new RedisConnection()
redis.connect().then((client) => {
  client.on('error', function (err) {
    console.error(err)
  })
})
const UserRepository = require('../repository/user-repository')
const repositories = {
  user: new UserRepository(redis.client)
}

require('../services/keys')(config, redis.client)

// Create a mock TemplateMailer
const templateMailer = {
  send: (cfg, template, to, name, data) => {
    return Promise.resolve()
  }
}

// Event handling
require('../config/command-handler')(repositories, emitter, config, templateMailer)
require('../config/event-handler')(repositories, emitter, config)

// Password strength
config.set('bcrypt_rounds', 1)

module.exports = {
  repositories,
  config,
  emitter,
  redis
}
