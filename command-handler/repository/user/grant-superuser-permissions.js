'use strict'

let GrantSuperUserPermissionCommand = require('../../../command/user/grant-superuser-permissions')

module.exports = {
  command: GrantSuperUserPermissionCommand,
  /**
   * @param {UserRepository} repository
   * @param {GrantSuperUserPermissionCommand} cmd
   * @return {SuperUserPermissionsRevokedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.grantSuperUserPermissions()
    return repository.eventStore.persist(event)
      .then(() => {
        return event
      })
  }
}
