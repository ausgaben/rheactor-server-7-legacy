'use strict'

const Promise = require('bluebird')
const EmailValue = require('rheactor-value-objects/email')
const SendUserEmailChangeConfirmationLinkCommand = require('../../command/user/send-email-change-confirmation-link')
const ChangeUserEmailCommand = require('../../command/user/email-change')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const Joi = require('joi')
const checkVersion = require('../check-version')
const _merge = require('lodash/merge')
const tokens = require('../../util/tokens')

/**
 * Manages email change requests.
 *
 * A user may request a to use a new email address, by supplying it to
 * /api/email-change
 * which will generate a token that is sent to the new address.
 * The user then can use supply the token to
 * /api/email-change/confirm
 * to confirm the change.
 *
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {UserRepository} userRepository
 * @param {express.Middleware} tokenAuth
 * @param {function} sendHttpProblem
 */
module.exports = function (app, config, emitter, userRepository, tokenAuth, sendHttpProblem) {
  app.post('/api/user/:id/email-change', tokenAuth, (req, res) => Promise
    .try(() => {
      if (req.params.id !== req.user) throw AccessDeniedError(req.url, 'This is not you.')
      const schema = Joi.object().keys({
        email: Joi.string().required().email()
      })
      const query = _merge({}, req.body)
      const v = Joi.validate(req.body, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      return userRepository.getById(req.user)
        .then(user => emitter.emit(new SendUserEmailChangeConfirmationLinkCommand(user, new EmailValue(v.value.email))))
    })
    .then(() => res.status(201).send())
    .catch(err => sendHttpProblem(res, err))
  )

  app.post('/api/user/:id/email-change/confirm', tokenAuth, (req, res) => Promise
    .try(() => {
      if (req.params.id !== req.user) throw AccessDeniedError(req.url, 'This is not you.')
      if (!tokens.isChangeEmailToken(req.authInfo)) throw new AccessDeniedError(req.url, 'Not a password change token')
      return userRepository.getById(req.user)
    })
    .then(user => {
      checkVersion(req.authInfo.payload['$aggregateMeta'][user.constructor.name].version, user)
      return emitter.emit(new ChangeUserEmailCommand(user, new EmailValue(req.authInfo.payload.email)))
    })
    .then(event => res
      .header('etag', event.aggregateVersion)
      .header('last-modified', new Date(event.createdAt).toUTCString())
      .status(204).send())
    .catch(err => sendHttpProblem(res, err))
  )
}
