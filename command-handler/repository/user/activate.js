'use strict'

let ActivateUserCommand = require('../../../command/user/activate')

module.exports = {
  command: ActivateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {DeactivateUserCommand} cmd
   * @return {UserDeactivatedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.activate()
    return repository.persistEvent(event, cmd.author)
  }
}
