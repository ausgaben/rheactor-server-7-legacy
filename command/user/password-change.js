'use strict'

/**
 * @param {UserModel} user
 * @param {String} password
 * @constructor
 */
function ChangeUserPasswordCommand (user, password) {
  this.user = user
  this.password = password
}

module.exports = ChangeUserPasswordCommand
