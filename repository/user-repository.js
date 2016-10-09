'use strict'

// @flow

/*::
 export type UserRepositoryType = {
 findByEmail: (email: EmailValue) => Promise<UserModel>
 }
 */

const AggregateRepository = require('rheactor-event-store/aggregate-repository')
const ModelEvent = require('rheactor-event-store/model-event')
const AggregateIndex = require('rheactor-event-store/aggregate-index')
const util = require('util')
const UserModel = require('../model/user')
const EntryNotFoundError = require('rheactor-value-objects/errors/entry-not-found')
const Promise = require('bluebird')
const UserCreatedEvent = require('../event/user/created')
const UserEmailChangedEvent = require('../event/user/email-changed')
const EmailValue = require('rheactor-value-objects/email')

/**
 * Creates a new user repository
 *
 * @param {redis.client} redis
 * @constructor
 */
var UserRepository = function (redis /*:any*/) {
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
    .catch(err => EntryNotFoundError.is(err), () => {
      return null
    })
}

/**
 * Find all users
 *
 * @param {Pagination} pagination
 * @return {Promise.<Array.<UserModel>>}
 */
UserRepository.prototype.listAll = function (pagination) {
  const self = this
  return self.index.getAll('email')
    .then(userIds => {
      const total = userIds.length
      return Promise.map(pagination.splice(userIds), userId => self.getById(userId))
        .then(users => pagination.result(users, total))
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
        throw new EntryNotFoundError('User with email "' + email.toString() + '" not found')
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
UserRepository.prototype.add = function (user) {
  let self = this

  let data = {
    email: user.email.toString(),
    firstname: user.firstname,
    lastname: user.lastname,
    password: user.password,
    isActive: user.isActive,
    avatar: undefined
  }
  if (user.avatar) {
    data.avatar = user.avatar.toString()
  }

  return Promise
    .resolve(self.redis.incrAsync(self.aggregateAlias + ':id'))
    .then((id) => {
      return self.index.addIfNotPresent('email', data.email, id)
        .then(() => {
          let event = new UserCreatedEvent(id, data)
          return self.eventStore
            .persist(event)
            .then(() => {
              user.applyEvent(event)
              return event
            })
        })
    })
}

/**
 * Persist a user event
 *
 * @param {ModelEvent} modelEvent
 * @param {UserModel} author
 */
UserRepository.prototype.persistEvent = function (modelEvent, author) {
  const self = this
  if (!author) {
    return AggregateRepository.prototype.persistEvent.call(self, modelEvent)
      .then(() => self.postPersist(modelEvent))
  }
  let event = new ModelEvent(modelEvent.aggregateId, modelEvent.name, modelEvent.data, modelEvent.createdAt, author.aggregateId())
  return AggregateRepository.prototype.persistEvent.call(self, event)
    .then(() => self.postPersist(event))
    .then(() => {
      let eventWithAuthor = Object.create(modelEvent.constructor.prototype)
      modelEvent.constructor.call(eventWithAuthor, event)
      return eventWithAuthor
    })
}

/**
 * Persist a user event
 *
 * @param {ModelEvent} modelEvent
 */
UserRepository.prototype.postPersist = function (modelEvent) {
  const self = this
  if (modelEvent.name === UserEmailChangedEvent.name) {
    return Promise
      .join(
        self.index.remove('email', modelEvent.data.oldemail, modelEvent.aggregateId),
        self.index.add('email', modelEvent.data.email, modelEvent.aggregateId)
      )
      .then(() => modelEvent)
  }
  return Promise.resolve(modelEvent)
}

module.exports = UserRepository
