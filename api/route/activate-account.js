'use strict'

let Promise = require('bluebird')
let ActivateUserCommand = require('../../command/user/activate')
let tokens = require('../../util/tokens')
let Errors = require('rheactor-value-objects/errors')
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
  app.post('/api/activate-account', tokenAuth, function (req, res) {
    Promise
      .try(() => {
        if (!tokens.isAccountActivationToken(req.authInfo)) {
          throw new Errors.AccessDeniedError(req.url, 'Not an account activation token')
        }
        return userRepository.getById(req.user)
          .then((user) => {
            checkVersion(req.authInfo.payload['$aggregateMeta'][user.constructor.name].version, user)
            return emitter.emit(new ActivateUserCommand(user))
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
