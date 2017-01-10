import GrantSuperUserPermissionCommand from '../../../command/user/grant-superuser-permissions'

export default {
  command: GrantSuperUserPermissionCommand,
  /**
   * @param {UserRepository} repository
   * @param {GrantSuperUserPermissionCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.grantSuperUserPermissions(cmd.author))
}
