'use strict'

/**
 * @param {UserModel} user
 * @param {JsonWebToken} token
 * @constructor
 */
function UserActivationLinkSentEvent (user, token) {
  this.user = user
  this.token = token
}

module.exports = UserActivationLinkSentEvent
