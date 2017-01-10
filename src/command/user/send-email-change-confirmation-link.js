/**
 * @param {UserModel} user
 * @param {EmailValue} email
 * @constructor
 */
function SendUserEmailChangeConfirmationLinkCommand (user, email) {
  this.user = user
  this.email = email
}

export default SendUserEmailChangeConfirmationLinkCommand
