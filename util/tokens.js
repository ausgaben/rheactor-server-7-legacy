'use strict'

const Promise = require('bluebird')
const jwt = require('jsonwebtoken')
const JsonWebToken = require('rheactor-web-app/js/model/jsonwebtoken')
const JSONLD = require('../config/jsonld')
const User = require('rheactor-web-app/js/model/user')

/**
 * @param {String} iss
 * @param {String} apiHost
 * @param {String} privateKey
 * @param {Number} tokenLifetime
 * @param {UserModel} user
 * @param {Object} payload
 * @returns {Promise.<JsonWebToken>}
 */
const sign = (iss, apiHost, privateKey, tokenLifetime, user, payload) => {
  let jsonld = JSONLD(apiHost)
  let aggregateMeta = {}
  aggregateMeta[user.constructor.name] = user.$aggregateMeta
  payload = payload || {}
  payload.$aggregateMeta = aggregateMeta
  return Promise.try(() => {
    let token = jwt.sign(
      payload,
      privateKey,
      {
        algorithm: 'RS256',
        issuer: iss,
        subject: jsonld.createId(User.$context, user.aggregateId()),
        expiresIn: tokenLifetime
      }
    )
    return new JsonWebToken(token)
  })
}
module.exports = {
  /**
   * @param {String} apiHost
   * @param {String} privateKey
   * @param {Number} tokenLifetime
   * @param {UserModel} user
   * @returns {Promise.<JsonWebToken>}
   */
  lostPasswordToken: sign.bind(null, 'password-change'),

  /**
   * {JsonWebToken} token
   * @returns {boolean}
   */
  isLostPasswordToken: (token) => token.iss === 'password-change',

  /**
   * @param {String} apiHost
   * @param {String} privateKey
   * @param {Number} tokenLifetime
   * @param {UserModel} user
   * @returns {Promise.<JsonWebToken>}
   */
  accountActivationToken: sign.bind(null, 'account-activation'),

  /**
   * {JsonWebToken} token
   * @returns {boolean}
   */
  isAccountActivationToken: (token) => token.iss === 'account-activation',

  /**
   * @param {String} apiHost
   * @param {String} privateKey
   * @param {Number} tokenLifetime
   * @param {UserModel} user
   * @param {EmailValue} email
   * @returns {Promise.<JsonWebToken>}
   */
  changeEmailToken: sign.bind(null, 'email-change'),

  /**
   * {JsonWebToken} token
   * @returns {boolean}
   */
  isChangeEmailToken: (token) => token.iss === 'email-change',

  /**
   * @param {String} apiHost
   * @param {String} publicKey
   * @param {JsonWebToken} token
   * @returns {Promise.<JsonWebToken>}
   */
  verify: (apiHost, publicKey, token) => {
    let jsonld = JSONLD(apiHost)
    return Promise.try(() => {
      let decoded = jwt.verify(token, publicKey, {algorithms: ['RS256']})
      if (decoded) {
        let t = new JsonWebToken(token)
        t.payload.sub_id = jsonld.parseId(User.$context, decoded.sub)
        return t
      }
    })
  }
}
