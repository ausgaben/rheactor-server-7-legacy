import DeactivateUserCommand from '../../../command/user/deactivate'

export default {
  command: DeactivateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {DeactivateUserCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.deactivate(cmd.author))
}
