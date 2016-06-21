'use strict'

let util = require('util')
let Joi = require('joi')
let EmailValue = require('rheactor-value-objects/email')
let AggregateRoot = require('rheactor-event-store/aggregate-root')
let ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException
let Promise = require('bluebird')
let _map = require('lodash/map')
let Errors = require('rheactor-value-objects/errors')
let UserCreatedEvent = require('../event/user/created')
let UserPasswordChangedEvent = require('../event/user/password-changed')
let UserActivatedEvent = require('../event/user/activated')
let UserAvatarUpdatedEvent = require('../event/user/avatar-updated')
let URIValue = require('rheactor-value-objects/uri')

let passwordRegex = /^\$2a\$\d+\$.+/

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
      throw new ValidationFailedException('UserModel validation failed', data, err)
    }
    this.email = data.email
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.password = data.password
    this.isActive = active
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
      // TODO: Log
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
  let self = this
  let data = event.data
  switch (event.name) {
    case 'UserCreatedEvent':
      this.email = new EmailValue(data.email)
      this.firstname = data.firstname
      this.lastname = data.lastname
      this.password = data.password
      this.isActive = data.isActive
      if (data.avatar) {
        this.avatar = new URIValue(data.avatar)
      }
      this.persisted(event.aggregateId, event.createdAt)
      break
    case 'UserPasswordChangedEvent':
      self.setPassword(data.password)
      self.updated(event.createdAt)
      break
    case 'UserActivatedEvent':
      self.activate()
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
