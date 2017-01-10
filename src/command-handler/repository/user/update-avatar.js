import UpdateUserAvatarCommand from '../../../command/user/update-avatar'

export default {
  command: UpdateUserAvatarCommand,
  /**
   * @param {UserRepository} repository
   * @param {UpdateUserAvatarCommand} cmd
   * @return {ModelEvent}
   */
  handler: (repository, cmd) => repository.persistEvent(cmd.user.setAvatar(cmd.avatar, cmd.author))
}
