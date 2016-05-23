'use strict'

let util = require('util')
let Joi = require('joi')
let EmailValue = require('rheactor-value-objects/email')
let Aggregator = require('rheactor-event-store/aggregator')
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
  Aggregator.AggregateRoot.call(this)
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
util.inherits(UserModel, Aggregator.AggregateRoot)

UserModel.prototype.setPassword = function (password) {
  let schema = Joi.object().keys({
    password: Joi.string().required().regex(passwordRegex).trim()
  })

  Joi.validate({password}, schema, {stripUnknown: true}, (err, data) => {
    if (err) {
      throw new ValidationFailedException('UserModel.password validation failed', data, err)
    }
    this.password = data.password
  })
}

UserModel.prototype.setAvatar = function (avatar) {
  let self = this
  Joi.validate(avatar, Joi.object().type(URIValue).required(), (err, priority) => {
    if (err) {
      throw new ValidationFailedException('ContributionModel.setAvatar validation failed', priority, err)
    }
    self.avatar = avatar
  })
}

UserModel.prototype.activate = function () {
  this.isActive = true
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
            user.persisted(id, event.eventCreatedAt)
            break
          default:
            user.apply(event.eventType, payload, event.eventCreatedAt)
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
 * @param {String} eventName
 * @param {object} payload
 * @param {Number} eventCreatedAt
 */
UserModel.prototype.apply = function (eventName, payload, eventCreatedAt) {
  let self = this
  switch (eventName) {
    case UserPasswordChangedEvent.name:
      self.setPassword(payload.password)
      self.updated(eventCreatedAt)
      break
    case UserActivatedEvent.name:
      self.activate()
      self.updated(eventCreatedAt)
      break
    case UserAvatarUpdatedEvent.name:
      self.setAvatar(new URIValue(payload.avatar))
      self.updated(eventCreatedAt)
      break
    default:
      // TODO: Log
      console.error('Unhandled UserModel event', eventName)
      throw new Errors.UnhandledDomainEvent(eventName)
  }
}

module.exports = UserModel
