import ChangeUserPasswordCommand from '../../../command/user/password-change'

export default {
  command: ChangeUserPasswordCommand,
  /**
   * @param {UserRepository} repository
   * @param {ChangeUserPasswordCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.setPassword(cmd.password, cmd.author))
}
