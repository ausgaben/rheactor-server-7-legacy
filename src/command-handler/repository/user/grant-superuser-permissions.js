import {GrantSuperUserPermissionsCommand} from '../../../command/user/grant-superuser-permissions'

export default {
  command: GrantSuperUserPermissionsCommand,
  /**
   * @param {UserRepository} repository
   * @param {GrantSuperUserPermissionsCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.grantSuperUserPermissions(cmd.author))
}
