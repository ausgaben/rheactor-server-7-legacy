'use strict'

const Promise = require('bluebird')
const Errors = require('rheactor-value-objects/errors')
const JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError')

module.exports = (verifyToken) => {
  return (token, cb) => {
    return Promise
      .resolve(verifyToken(token))
      .then((t) => {
        return cb(null, t.payload.sub_id, t)
      })
      .catch(Errors.TokenExpiredError, JsonWebTokenError, () => {
        return cb(null, false)
      })
      .catch((err) => {
        return cb(err)
      })
  }
}
