'use strict'

const Promise = require('bluebird')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const CreateUserCommand = require('../../command/user/create')
const EmailValue = require('rheactor-value-objects/email')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const Joi = require('joi')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {UserRepository} userRepo
 * @param tokenAuth
 * @param {function} sendHttpProblem
 * @param {function} transformer
 */
module.exports = (app, config, emitter, userRepo, tokenAuth, sendHttpProblem, transformer) => {
  /**
   * Returns the user account of the authenticated user
   */
  app.get('/api/user/:id', tokenAuth, (req, res) => Promise
    .try(() => {
      if (req.params.id !== req.user) {
        throw new AccessDeniedError(req.url, 'This is not you.')
      }
      return userRepo.getById(req.user)
    })
    .then((user) => {
      let userModel = transformer(user)
      return res
        .send(userModel)
    })
    .catch(sendHttpProblem.bind(null, res))
  )

  /**
   * Admins can create activated users, their password is set to 12345678
   */
  app.post('/api/user', tokenAuth, (req, res) => {
    let schema = Joi.object().keys({
      email: Joi.string().email().required(),
      firstname: Joi.string().trim().required(),
      lastname: Joi.string().trim().required()
    })
    return Promise
      .try(() => {
        let v = Joi.validate(req.body, schema)
        if (v.error) {
          throw new ValidationFailedError('Validation failed', req.body, v.error)
        }
        return userRepo.getById(req.user)
          .then(admin => {
            if (!admin.superUser) throw new AccessDeniedError(req.url, 'SuperUser privileges required.')
            return emitter.emit(new CreateUserCommand(new EmailValue(v.value.email), v.value.firstname, v.value.lastname, '$2a$04$9J9g5cfQKyf1bMCQZg7oGua.CjHe5lfOQs4jW5fwGN/Gm5zTxPqh2', true))
          })
      })
      .then(() => res.status(201).send())
      .catch(sendHttpProblem.bind(null, res))
  })
}
