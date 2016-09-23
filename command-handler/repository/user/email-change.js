'use strict'

let ChangeUserEmailCommand = require('../../../command/user/email-change')

module.exports = {
  command: ChangeUserEmailCommand,
  /**
   * @param {UserRepository} repository
   * @param {ChangeUserEmailCommand} cmd
   * @return {UserEmailChangedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.setEmail(cmd.email)
    return repository.persistEvent(event, cmd.author)
  }
}
