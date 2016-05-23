'use strict'

/**
 * @param {UserModel} user
 * @param {EmailValue} email
 * @constructor
 */
function ConfirmUserMailCommand (user, email) {
  this.user = user
  this.email = email
}

module.exports = ConfirmUserMailCommand
