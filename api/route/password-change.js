'use strict'

let Promise = require('bluebird')
let EmailValue = require('rheactor-value-objects/email')
let SendUserPasswordChangeConfirmationLinkCommand = require('../../command/user/send-password-change-confirmation-link')
let ChangeUserPasswordCommand = require('../../command/user/password-change')
let tokens = require('../../util/tokens')
let bcrypt = require('bcrypt')
Promise.promisifyAll(bcrypt)
let Errors = require('rheactor-value-objects/errors')
let Joi = require('joi')
let checkVersion = require('../check-version')

/**
 * Manages reset-password requests.
 *
 * If a user is not found, the response is delayed for 1000ms
 *
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {UserRepository} userRepository
 * @param {express.Middleware} tokenAuth
 * @param {function} sendHttpProblem
 */
module.exports = function (app, config, emitter, userRepository, tokenAuth, sendHttpProblem) {
  app.post('/api/password-change', function (req, res) {
    Promise
      .try(() => {
        let schema = Joi.object().keys({
          email: Joi.string().lowercase().email().required()
        })
        return Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
          if (err) {
            throw new Errors.ValidationFailedException('Not an email', data, err)
          }
          let email = new EmailValue(data.email)
          return userRepository.getByEmail(email)
        })
      })
      .then((user) => {
        return emitter.emit(new SendUserPasswordChangeConfirmationLinkCommand(user))
      })
      .then(() => {
        return res
          .status(201)
          .send()
      })
      .catch(function (err) {
        err.punish = true
        return sendHttpProblem(res, err)
      })
  })

  app.post('/api/password-change/confirm', tokenAuth, function (req, res) {
    Promise
      .try(() => {
        let schema = Joi.object().keys({
          password: Joi.string().required().min(8).trim()
        })
        return Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
          if (err) {
            throw new Errors.ValidationFailedException('Invalid password', data, err)
          }
          if (!tokens.isLostPasswordToken(req.authInfo)) {
            throw new Errors.AccessDeniedError(req.url, 'Not a password change token')
          }
          return userRepository.getById(req.user)
            .then((user) => {
              checkVersion(req.authInfo.payload['$aggregateMeta'][user.constructor.name].version, user)
              return bcrypt
                .genSaltAsync(config.get('bcrypt_rounds'))
                .then(bcrypt.hashAsync.bind(bcrypt, data.password))
                .then((hashedPassword) => {
                  delete req.body.password
                  return emitter.emit(new ChangeUserPasswordCommand(user, hashedPassword))
                })
            })
        })
      })
      .then(() => {
        return res
          .status(204)
          .send()
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
