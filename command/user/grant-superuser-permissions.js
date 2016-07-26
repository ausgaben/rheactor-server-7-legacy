'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function GrantSuperUserPermissionCommand (user) {
  this.user = user
}

module.exports = GrantSuperUserPermissionCommand
