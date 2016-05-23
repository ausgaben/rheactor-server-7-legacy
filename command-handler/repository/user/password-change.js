'use strict'

let ChangeUserPasswordCommand = require('../../../command/user/password-change')
let UserPasswordChangedEvent = require('../../../event/user/password-changed')

module.exports = {
  command: ChangeUserPasswordCommand,
  /**
   * @param {UserRepository} repository
   * @param {ChangeUserPasswordCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => {
    let event = new UserPasswordChangedEvent(cmd.user)
    let payload = {password: cmd.password}
    cmd.user.apply(event.constructor.name, payload)
    return repository.persist(cmd.user.aggregateId(), event, payload)
      .then(() => {
        return event
      })
  }
}
