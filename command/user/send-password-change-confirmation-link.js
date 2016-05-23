'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function SendUserPasswordChangeConfirmationLinkCommand (user) {
  this.user = user
}

module.exports = SendUserPasswordChangeConfirmationLinkCommand
