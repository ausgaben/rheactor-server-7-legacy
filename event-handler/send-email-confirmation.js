'use strict'

let UserCreatedEvent = require('../event/user/created')
let ConfirmUserEmailCommand = require('../command/user/confirm-email')

/**
 * Send the user an email in order for them to confirm their email address
 */
module.exports = () => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(UserCreatedEvent,
      /**
       * @param {UserCreatedEvent} event
       */
      (event) => {
        if (event.user.isActive) {
          return
        }
        c.emitter.emit(new ConfirmUserEmailCommand(event.user, event.user.email))
      })
  }
}
