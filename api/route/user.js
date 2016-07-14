'use strict'

const Promise = require('bluebird')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {UserRepository} userRepo
 * @param tokenAuth
 * @param {function} sendHttpProblem
 * @param {function} transformer
 */
module.exports = function (app, config, userRepo, tokenAuth, sendHttpProblem, transformer) {
  app.get('/api/user/:id', tokenAuth, function (req, res) {
    Promise
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
  })
}
