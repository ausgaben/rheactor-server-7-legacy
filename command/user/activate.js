'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function ActivateUserCommand (user) {
  this.user = user
}

module.exports = ActivateUserCommand
