'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function DeactivateUserCommand (user) {
  this.user = user
}

module.exports = DeactivateUserCommand
