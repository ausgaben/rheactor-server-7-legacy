'use strict'

const Promise = require('bluebird')
const EmailValue = require('rheactor-value-objects/email')
const CreateUserCommand = require('../../command/user/create')
const bcrypt = Promise.promisifyAll(require('bcrypt'))
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const ConflictError = require('rheactor-value-objects/errors/conflict')

/**
 * @param {express.app} app
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 * @param {UserRepository} userRepository
 * @param {function} sendHttpProblem
 */
module.exports = function (app, config, emitter, userRepository, sendHttpProblem) {
  /**
   * Register a new account, needs to be activated afterwards
   */
  app.post('/api/registration', (req, res) => Promise
    .try(() => {
      if (!req.body.password) {
        throw new ValidationFailedError('missing password')
      }
      return bcrypt
        .genSaltAsync(config.get('bcrypt_rounds'))
        .then(bcrypt.hashAsync.bind(bcrypt, req.body.password))
        .then((hashedPassword) => {
          delete req.body.password
          let email = new EmailValue(req.body.email)
          return userRepository.findByEmail(email)
            .then((user) => {
              if (user) {
                throw new ConflictError('Already registered!')
              }
              emitter.emit(new CreateUserCommand(email, req.body.firstname, req.body.lastname, hashedPassword))
            })
        })
    })
    .then(() => {
      return res
        .status(201)
        .send()
    })
    .catch(sendHttpProblem.bind(null, res))
  )
}
