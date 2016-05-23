'use strict'

let Promise = require('bluebird')
let EmailValue = require('rheactor-value-objects/email')
let CreateUserCommand = require('../../command/user/create')
let bcrypt = require('bcrypt')
Promise.promisifyAll(bcrypt)
let Errors = require('rheactor-value-objects/errors')

/**
 * @param {express.app} app
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 * @param {UserRepository} userRepository
 * @param {function} sendHttpProblem
 */
module.exports = function (app, config, emitter, userRepository, sendHttpProblem) {
  app.post('/api/registration', function (req, res) {
    Promise
      .try(() => {
        if (!req.body.password) {
          throw new Errors.ValidationFailedException('missing password')
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
                  throw new Errors.ConflictError('Already registered!')
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
  })
}
