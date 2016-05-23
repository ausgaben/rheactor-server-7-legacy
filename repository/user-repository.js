'use strict'

let EventStore = require('rheactor-event-store/event-store')
let AggregateRepository = require('rheactor-event-store/aggregate-repository')
let AggregateIndex = require('rheactor-event-store/aggregate-index')
let util = require('util')
let UserModel = require('../model/user')
let Errors = require('rheactor-value-objects/errors')

/**
 * Creates a new user repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var UserRepository = function (redis) {
  AggregateRepository.call(this, UserModel, 'user', redis)
  this.index = new AggregateIndex(this.aggregateAlias, redis)
}
util.inherits(UserRepository, AggregateRepository)

/**
 * Find a user by email
 *
 * @param {EmailValue} email
 * @return {Promise.<UserModel>}
 */
UserRepository.prototype.findByEmail = function (email) {
  let self = this
  return self
    .getByEmail(email)
    .catch((err) => {
      if (!/EntityNotFoundError/.test(err.name)) {
        console.error('UserRepository error', err)
      }
      return null
    })
}

/**
 * Get a user by email
 *
 * @param {EmailValue} email
 * @return {Promise.<UserModel>}
 */
UserRepository.prototype.getByEmail = function (email) {
  let self = this
  return self.index.find('email', email.toString())
    .then((id) => {
      if (!id) {
        throw new Errors.EntityNotFoundError('User with email "' + email.toString() + '" not found')
      }
      return self.constructor.super_.prototype.getById.call(self, id)
    })
}

/**
 * Create a new user
 *
 * The precondition is that a user with the same email address must not exist,
 * therefore the email address index for this aggregate is consulted before
 *
 * @param {UserModel} user
 * @returns {Promise.<Number>} of the id
 */
UserRepository.prototype.create = function (user) {
  let self = this

  let data = {
    email: user.email.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    password: user.password,
    isActive: user.isActive
  }
  if (user.avatar) {
    data.avatar = user.avatar.toString()
  }

  return self.redis.incrAsync(self.aggregateAlias + ':id')
    .then((id) => {
      return self.index.addIfNotPresent('email', data.email, id)
        .then(self.eventStore.persist.bind(
          self.eventStore,
          id,
          new EventStore.Event('UserCreatedEvent', data)
        ))
        .then(() => {
          // Secondary indices go here
          // …
          // NOTE: Indices are not guaranteed to be up to date immediately, so return id right away
          return id
        })
    })
}

/**
 * Persist a user event
 *
 * @param {String} id Aggregate id
 * @param event
 * @param data
 */
UserRepository.prototype.persist = function (id, event, data) {
  let self = this
  if (!id) {
    throw new Error('Must provide id')
  }
  if (!event.constructor.name) {
    throw new Error('Must provide event', event)
  }
  return self.eventStore
    .persist(
      id,
      new EventStore.Event(event.constructor.name, data)
    )
}

module.exports = UserRepository
