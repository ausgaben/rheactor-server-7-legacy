'use strict'

/**
 * @param {UserModel} user
 * @param {String} email
 * @constructor
 */
function ChangeUserEmailCommand (user, email) {
  this.user = user
  this.email = email
}

module.exports = ChangeUserEmailCommand
