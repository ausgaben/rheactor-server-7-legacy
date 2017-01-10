import SendUserPasswordChangeConfirmationLinkCommand from '../command/user/send-password-change-confirmation-link'

export default {
  arguments: '<email>',
  description: 'Send the lost password email to the user with the email <email>',
  action: (backend, email) => {
    return backend.repositories.user.getByEmail(email)
      .then((user) => {
        return backend.emitter.emit(new SendUserPasswordChangeConfirmationLinkCommand(user))
      })
  }
}
