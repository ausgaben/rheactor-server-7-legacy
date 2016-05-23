'use strict'

let Promise = require('bluebird')
let Errors = require('rheactor-value-objects/errors')
let transformer = require('../transformer')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {UserRepository} userRepo
 * @param tokenAuth
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 */
module.exports = function (app, config, userRepo, tokenAuth, jsonld, sendHttpProblem) {
  app.get('/api/user/:id', tokenAuth, function (req, res) {
    Promise
      .try(() => {
        if (req.params.id !== req.user) {
          throw new Errors.AccessDeniedError(req.url, 'This is not you.')
        }
        return userRepo.getById(req.user)
      })
      .then((user) => {
        let userModel = transformer.user(user, jsonld)
        return res
          .send(userModel)
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
