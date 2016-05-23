'use strict'

/**
 * @param {UserModel} user
 * @param {URIValue} avatar
 * @constructor
 */
function UpdateUserAvatarCommand (user, avatar) {
  this.user = user
  this.avatar = avatar
}

module.exports = UpdateUserAvatarCommand
