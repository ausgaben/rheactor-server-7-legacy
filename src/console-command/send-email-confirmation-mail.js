import ConfirmUserEmailCommand from '../command/user/confirm-email'

export default {
  arguments: '<email>',
  description: 'Send the email confirmation mail to the user with the email <email>',
  action: (backend, email) => {
    return backend.repositories.user.getByEmail(email)
      .then((user) => {
        return backend.emitter.emit(new ConfirmUserEmailCommand(user, user.email))
      })
  }
}
