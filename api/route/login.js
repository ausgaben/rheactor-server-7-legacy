'use strict'

const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt'))
const jwt = require('jsonwebtoken')
const JsonWebToken = require('rheactor-web-app/js/model/jsonwebtoken')
const EmailValue = require('rheactor-value-objects/email')
const User = require('rheactor-web-app/js/model/user')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const Joi = require('joi')

/**
 * Manages user logins.
 *
 * If a user is not found, the response is delayed for 1000ms
 *
 * @param app
 * @param config
 * @param {UserRepository} userRepository
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 */
module.exports = (app, config, userRepository, jsonld, sendHttpProblem) => {
  app.post('/api/login', (req, res) => {
    Promise
      .try(() => {
        let schema = Joi.object().keys({
          email: Joi.string().email().lowercase().required(),
          password: Joi.string().required().min(8).trim()
        })
        return Joi.validate(req.body, schema, {stripUnknown: true}, (err, data) => {
          if (err) {
            throw new ValidationFailedError('Invalid data', data, err)
          }
          return userRepository.getByEmail(new EmailValue(data.email))
            .then((user) => {
              if (!user.isActive) {
                throw new AccessDeniedError(req.url, 'Inactive account', {email: data.email})
              }
              return bcrypt.compareAsync(data.password, user.password)
                .then((match) => {
                  if (!match) {
                    throw new AccessDeniedError(req.url, 'Invalid password provided', {email: data.email})
                  } else {
                    return jwt.sign(
                      {},
                      config.get('private_key'),
                      {
                        algorithm: 'RS256',
                        issuer: 'login',
                        subject: jsonld.createId(User.$context, user.aggregateId()),
                        expiresIn: config.get('token_lifetime')
                      }
                    )
                  }
                })
            })
            .then((token) => {
              return res
                .status(201)
                .send(new JsonWebToken(token, jsonld.createLinks(JsonWebToken.$context, token)))
            })
        })
      })
      .catch(function (err) {
        err.punish = true
        return sendHttpProblem(res, err)
      })
  })
}
