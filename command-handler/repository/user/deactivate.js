'use strict'

let DeactivateUserCommand = require('../../../command/user/deactivate')

module.exports = {
  command: DeactivateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {DeactivateUserCommand} cmd
   * @return {UserDeactivatedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.deactivate()
    return repository.persistEvent(event, cmd.author)
  }
}
