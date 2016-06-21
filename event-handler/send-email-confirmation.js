'use strict'

let UserCreatedEvent = require('../event/user/created')
let ConfirmUserEmailCommand = require('../command/user/confirm-email')

/**
 * Send the user an email in order for them to confirm their email address
 *
 * @param {UserRepository} userRepo
 */
module.exports = (userRepo) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(UserCreatedEvent,
      /**
       * @param {UserCreatedEvent} event
       */
      (event) => {
        return userRepo.getById(event.aggregateId)
          .then((user) => {
            if (user.isActive) {
              return
            }
            c.emitter.emit(new ConfirmUserEmailCommand(user, user.email))
          })
      })
  }
}
