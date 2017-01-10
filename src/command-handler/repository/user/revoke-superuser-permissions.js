import RevokeSuperUserPermissionCommand from '../../../command/user/revoke-superuser-permissions'

export default {
  command: RevokeSuperUserPermissionCommand,
  /**
   * @param {UserRepository} repository
   * @param {RevokeSuperUserPermissionCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.revokeSuperUserPermissions(cmd.author))
}
