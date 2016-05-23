'use strict'

let UpdateUserAvatarCommand = require('../../../command/user/update-avatar')
let UserAvatarUpdatedEvent = require('../../../event/user/avatar-updated')

module.exports = {
  command: UpdateUserAvatarCommand,
  /**
   * @param {UserRepository} repository
   * @param {UpdateUserAvatarCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => {
    let event = new UserAvatarUpdatedEvent(cmd.user)
    let payload = {avatar: cmd.avatar.toString()}
    cmd.user.apply(event.constructor.name, payload)
    return repository.persist(cmd.user.aggregateId(), event, payload)
      .then(() => {
        return event
      })
  }
}
