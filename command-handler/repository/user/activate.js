'use strict'

let ActivateUserCommand = require('../../../command/user/activate')

module.exports = {
  command: ActivateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {ActivateUserCommand} cmd
   * @return {UserActivatedEvent}
   */
  handler: (repository, cmd) => {
    let event = cmd.user.activate()
    return repository.eventStore.persist(event)
      .then(() => {
        return event
      })
  }
}
