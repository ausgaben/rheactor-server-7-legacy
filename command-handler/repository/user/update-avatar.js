'use strict'

let UpdateUserAvatarCommand = require('../../../command/user/update-avatar')

module.exports = {
  command: UpdateUserAvatarCommand,
  /**
   * @param {UserRepository} repository
   * @param {UpdateUserAvatarCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.setAvatar(cmd.avatar)
    return repository.eventStore.persist(event)
      .then(() => {
        return event
      })
  }
}
