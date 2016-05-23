'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function UserAvatarUpdatedEvent (user) {
  this.user = user
}

module.exports = UserAvatarUpdatedEvent
