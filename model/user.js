'use strict'

const util = require('util')
const Joi = require('joi')
const EmailValue = require('rheactor-value-objects/email')
const AggregateRoot = require('rheactor-event-store/aggregate-root')
const ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException
const Promise = require('bluebird')
const _map = require('lodash/map')
const Errors = require('rheactor-value-objects/errors')
const UserCreatedEvent = require('../event/user/created')
const UserPasswordChangedEvent = require('../event/user/password-changed')
const UserActivatedEvent = require('../event/user/activated')
const UserAvatarUpdatedEvent = require('../event/user/avatar-updated')
const URIValue = require('rheactor-value-objects/uri')

const passwordRegex = /^\$2a\$\d+\$.+/

/**
 * @param {EmailValue} email
 * @param {String} firstname
 * @param {String} lastname
 * @param {String} password
 * @param {Boolean} active
 * @param {URIValue} avatar
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
 */
function UserModel (email, firstname, lastname, password, active, avatar) {
  AggregateRoot.call(this)
  active = active || false
  let schema = Joi.object().keys({
    email: Joi.object().type(EmailValue).required(),
    firstname: Joi.string().required().trim(),
    lastname: Joi.string().required().trim(),
    password: Joi.string().required().regex(passwordRegex).trim(),
    active: Joi.boolean(),
    avatar: Joi.object().type(URIValue)
  })

  Joi.validate({email, firstname, lastname, password, active, avatar}, schema, {stripUnknown: true}, (err, data) => {
    if (err) {
      throw new ValidationFailedException('UserModel validation failed: ' + err, data, err)
    }
    this.email = data.email
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.password = data.password
    this.isActive = active
    if (active) this.activatedAt = Date.now()
    this.avatar = avatar
  })
}
util.inherits(UserModel, AggregateRoot)

/**
 * @param {String} password
 * @return {UserPasswordChangedEvent}
 * @throws ValidationFailedException
 */
UserModel.prototype.setPassword = function (password) {
  let self = this
  let schema = Joi.object().keys({
    password: Joi.string().required().regex(passwordRegex).trim()
  })

  return Joi.validate({password}, schema, {stripUnknown: true}, (err, data) => {
    if (err) {
      throw new ValidationFailedException('UserModel.password validation failed', data, err)
    }
    this.password = data.password
    return new UserPasswordChangedEvent(self.aggregateId(), {password: data.password})
  })
}

UserModel.prototype.setAvatar = function (avatar) {
  let self = this
  return Joi.validate(avatar, Joi.object().type(URIValue).required(), (err, priority) => {
    if (err) {
      throw new ValidationFailedException('ContributionModel.setAvatar validation failed', priority, err)
    }
    self.avatar = avatar
    return new UserAvatarUpdatedEvent(self.aggregateId(), {avatar: avatar.toString()})
  })
}

/**
 * @return {UserActivatedEvent}
 * @throws {ConflictError}
 */
UserModel.prototype.activate = function () {
  let self = this
  if (this.isActive) {
    throw new Errors.ConflictError('Already activated!')
  }
  this.isActive = true
  this.activatedAt = Date.now()
  return new UserActivatedEvent(self.aggregateId())
}

/**
 * @returns {string}
 */
UserModel.prototype.name = function () {
  return [this.firstname, this.lastname].join(' ')
}

UserModel.aggregate = function (id, events) {
  return Promise
    .try(() => {
      let user
      _map(events, (event) => {
        let payload = event.eventPayload
        switch (event.eventType) {
          case UserCreatedEvent.name:
            user = new UserModel(
              new EmailValue(payload.email),
              payload.firstname,
              payload.lastname,
              payload.password,
              payload.isActive,
              payload.avatar ? new URIValue(payload.avatar) : undefined
            )
            user.persisted(id, event.event.createdAt)
            break
          default:
            user.apply(event.eventType, payload, event.event.createdAt)
        }
      })
      return user
    })
    .catch((err) => {
      console.error('UserModel error', err)
      return null
    })
}

/**
 * Applies the event
 *
 * @param {ModelEvent} event
 */
UserModel.prototype.applyEvent = function (event) {
  const self = this
  const data = event.data
  switch (event.name) {
    case 'UserCreatedEvent':
      self.email = new EmailValue(data.email)
      self.firstname = data.firstname
      self.lastname = data.lastname
      self.password = data.password
      self.isActive = data.isActive
      self.activatedAt = event.createdAt
      if (data.avatar) {
        self.avatar = new URIValue(data.avatar)
      }
      self.persisted(event.aggregateId, event.createdAt)
      break
    case 'UserPasswordChangedEvent':
      self.setPassword(data.password)
      self.updated(event.createdAt)
      break
    case 'UserActivatedEvent':
      self.isActive = true
      self.activatedAt = event.createdAt
      self.updated(event.createdAt)
      break
    case 'UserAvatarUpdatedEvent':
      self.setAvatar(new URIValue(data.avatar))
      self.updated(event.createdAt)
      break
    default:
      console.error('Unhandled UserModel event', event.name)
      throw new Errors.UnhandledDomainEvent(event.name)
  }
}

module.exports = UserModel
