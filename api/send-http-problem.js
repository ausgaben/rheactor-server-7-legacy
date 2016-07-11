'use strict'

const Promise = require('bluebird')
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')
const PermissionDeniedError = require('rheactor-value-objects/errors/permission-denied')
const EntityNotFoundError = require('rheactor-value-objects/errors/entity-not-found')
const ConflictError = require('rheactor-value-objects/errors/conflict')
const EntryAlreadyExistsError = require('rheactor-value-objects/errors/entry-already-exists')
const ValidationFailedException = require('rheactor-value-objects/errors/validation-failed')
const EntityDeletedError = require('rheactor-value-objects/errors/entity-deleted')
const PaymentRequiredException = require('rheactor-value-objects/errors/payment-required')

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
  if (err.name === 'TokenExpiredError' || err.name === AccessDeniedError.name || err.name === PermissionDeniedError.name) {
    status = 403
    punish = true
  }
  if (err.name === EntityNotFoundError.name) {
    status = 404
  }
  if (err.name === ConflictError.name || err.name === EntryAlreadyExistsError.name) {
    status = 409
  }
  if (err.name === ValidationFailedException.name) {
    status = 400
  }
  if (err.name === EntityDeletedError.name) {
    status = 404
  }
  if (err.name === PaymentRequiredException.name) {
    status = 402
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
