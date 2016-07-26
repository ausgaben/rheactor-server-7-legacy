'use strict'

let RevokeSuperUserPermissionCommand = require('../../../command/user/revoke-superuser-permissions')

module.exports = {
  command: RevokeSuperUserPermissionCommand,
  /**
   * @param {UserRepository} repository
   * @param {RevokeSuperUserPermissionCommand} cmd
   * @return {SuperUserPermissionsRevokedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.revokeSuperUserPermissions()
    return repository.eventStore.persist(event)
      .then(() => {
        return event
      })
  }
}
