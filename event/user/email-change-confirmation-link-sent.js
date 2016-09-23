'use strict'

/**
 * @param {UserModel} user
 * @param {EmailValue} email
 * @param {JsonWebToken} token
 * @constructor
 */
function UserEmailChangeConfirmationLinkSentEvent (user, email, token) {
  this.user = user
  this.email = email
  this.token = token
}

module.exports = UserEmailChangeConfirmationLinkSentEvent
