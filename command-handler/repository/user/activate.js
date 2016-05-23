'use strict'

let ActivateUserCommand = require('../../../command/user/activate')
let UserActivatedEvent = require('../../../event/user/activated')

module.exports = {
  command: ActivateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {ActivateUserCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => {
    let event = new UserActivatedEvent(cmd.user)
    cmd.user.apply(event.constructor.name)
    return repository.persist(cmd.user.aggregateId(), event)
      .then(() => {
        return event
      })
  }
}
