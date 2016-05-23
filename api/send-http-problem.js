'use strict'

let Promise = require('bluebird')
let HttpProblem = require('rheactor-web-app/js/model/http-problem')

/**
 * @param {string} environment
 * @param res
 * @param err
 * @returns {Promise.<TResult>}
 */
let sendHttpProblem = (environment, res, err) => {
  let status = 500
  let punish = false
  let punishTime = environment === 'production' ? 1000 : 0
  if (err.name === 'TokenExpiredError' || err.name === 'AccessDeniedError' || err.name === 'PermissionDeniedError') {
    status = 403
    punish = true
  }
  if (err.name === 'EntityNotFoundError') {
    status = 404
  }
  if (err.name === 'ConflictError' || err.name === 'EntryAlreadyExistsError') {
    status = 409
  }
  if (err.name === 'ValidationFailedException') {
    status = 400
  }
  if (err.name === 'EntityDeletedError') {
    status = 404
  }
  if (status === 500) { // Unknown
    console.error(err.name)
    console.error(err.message)
    console.error(err.stack)
  }
  return Promise.delay(punish || err.punish ? punishTime : 0).then(() => {
    return res
      .status(status)
      .send(HttpProblem.fromException(err, status))
  })
}

module.exports = sendHttpProblem
