'use strict'

/**
 * @param {UserModel} user
 * @constructor
 */
function RevokeSuperUserPermissionCommand (user) {
  this.user = user
}

module.exports = RevokeSuperUserPermissionCommand
