'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function UserPasswordChangedEvent (user) {
  this.user = user
}

module.exports = UserPasswordChangedEvent
