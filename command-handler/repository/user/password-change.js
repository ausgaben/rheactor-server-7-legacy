'use strict'

let ChangeUserPasswordCommand = require('../../../command/user/password-change')

module.exports = {
  command: ChangeUserPasswordCommand,
  /**
   * @param {UserRepository} repository
   * @param {ChangeUserPasswordCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.setPassword(cmd.password)
    return repository.eventStore.persist(event)
      .then(() => {
        return event
      })
  }
}
