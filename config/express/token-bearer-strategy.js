'use strict'

const Promise = require('bluebird')
const JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError')
const TokenExpiredError = require('rheactor-value-objects/errors/token-expired')

module.exports = (verifyToken) => {
  return (token, cb) => {
    return Promise
      .resolve(verifyToken(token))
      .then((t) => {
        return cb(null, t.payload.sub_id, t)
      })
      .catch(TokenExpiredError, JsonWebTokenError, () => {
        return cb(null, false)
      })
      .catch((err) => {
        return cb(err)
      })
  }
}
