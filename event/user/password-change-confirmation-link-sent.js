'use strict'

/**
 * @param {UserModel} user
 * @param {JsonWebToken} token
 * @constructor
 */
function UserPasswordChangeConfirmationLinkSentEvent (user, token) {
  this.user = user
  this.token = token
}

module.exports = UserPasswordChangeConfirmationLinkSentEvent
