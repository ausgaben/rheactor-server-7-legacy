'use strict'

/**
 * @param {UserModel} user
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
 */
function UserCreatedEvent (user) {
  this.user = user
}

module.exports = UserCreatedEvent
