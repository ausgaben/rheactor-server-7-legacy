'use strict'

let ConfirmUserEmailCommand = require('../command/user/confirm-email')

module.exports = {
  arguments: '<email>',
  description: 'Send the email confirmation mail to the user with the email <email>',
  action: (backend, email) => {
    return backend.repositories.user.getByEmail(email)
      .then((user) => {
        return backend.emitter.emit(new ConfirmUserEmailCommand(user, user.email))
      })
  }
}
