'use strict'

/**
 * @param {UserModel} user
 * @param {UserModel} author
 * @constructor
 */
function DeactivateUserCommand (user, author) {
  this.user = user
  this.author = author
}

module.exports = DeactivateUserCommand
