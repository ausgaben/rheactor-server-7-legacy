import ActivateUserCommand from '../../../command/user/activate'

export default {
  command: ActivateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {ActivateUserCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.activate(cmd.author))
}
