'use strict'

const Promise = require('bluebird')
const EmailValue = require('rheactor-value-objects/email')
const SendUserPasswordChangeConfirmationLinkCommand = require('../../command/user/send-password-change-confirmation-link')
const ChangeUserPasswordCommand = require('../../command/user/password-change')
const tokens = require('../../util/tokens')
const bcrypt = Promise.promisifyAll(require('bcrypt'))
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const Joi = require('joi')
const checkVersion = require('../check-version')

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
            throw new ValidationFailedError('Not an email', data, err)
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
            throw new ValidationFailedError('Invalid password', data, err)
          }
          if (!tokens.isLostPasswordToken(req.authInfo)) {
            throw new AccessDeniedError(req.url, 'Not a password change token')
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
