'use strict'

const Promise = require('bluebird')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const UpdateUserPropertyCommand = require('../../command/user/update-property')
const ActivateUserCommand = require('../../command/user/activate')
const DeactivateUserCommand = require('../../command/user/deactivate')
const ConflictError = require('rheactor-value-objects/errors/conflict')
const Joi = require('joi')
const checkVersion = require('../check-version')
const _merge = require('lodash/merge')
const verifySuperUser = require('../verify-superuser')

/**
 * Manages profile change requests.
 *
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {UserRepository} userRepository
 * @param {express.Middleware} tokenAuth
 * @param {function} sendHttpProblem
 */
module.exports = function (app, config, emitter, userRepository, tokenAuth, sendHttpProblem) {
  app.put('/api/user/:id/:property', tokenAuth, (req, res) => Promise
    .try(() => {
      const schema = Joi.object().keys({
        id: Joi.string().min(1).trim(),
        property: Joi.string().only(['firstname', 'lastname', 'active']).required().trim(),
        value: Joi.any().required()
      })
      const query = _merge({}, req.body)
      query.property = req.params.property
      query.id = req.params.id
      const v = Joi.validate(query, schema)
      if (v.error) {
        throw new ValidationFailedError('Validation failed', query, v.error)
      }
      const property = v.value.property
      const value = v.value.value
      return Promise
        .try(() => {
          if (req.params.id !== req.user || property === 'active') {
            return Promise.join(
              userRepository.getById(req.params.id),
              verifySuperUser(req, userRepository)
            )
          } else {
            return Promise.join(
              userRepository.getById(req.user),
              null
            )
          }
        })
        .spread((user, author) => {
          author = author || user
          checkVersion(req.headers['if-match'], user)
          let cmd
          switch (property) {
            case 'active':
              if (value) {
                if (user.isActive) throw new ConflictError('User is active!')
                cmd = new ActivateUserCommand(user, author)
              } else {
                if (!user.isActive) throw new ConflictError('User is not active!')
                cmd = new DeactivateUserCommand(user, author)
              }
              break
            default:
              if (user[property] === value) throw new ConflictError(property + ' not changed ("' + value + '")!')
              cmd = new UpdateUserPropertyCommand(user, property, value, author)
          }
          return emitter.emit(cmd)
            .then(event => res
              .header('etag', user.aggregateVersion())
              .header('last-modified', new Date(event.createdAt).toUTCString())
              .status(204).send())
        })
    })

    .catch(err => sendHttpProblem(res, err))
  )
}
