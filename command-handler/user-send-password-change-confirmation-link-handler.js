'use strict'

let SendUserPasswordChangeConfirmationLinkCommand = require('../command/user/send-password-change-confirmation-link')
let UserPasswordChangeConfirmationLinkSentEvent = require('../event/user/password-change-confirmation-link-sent')
let tokens = require('../util/tokens')

/**
 * Send a password reset token if requested
 *
 * @param {TemplateMailerClient} templateMailerClient
 * @param {Object} config
 */
module.exports = (templateMailerClient, config) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(SendUserPasswordChangeConfirmationLinkCommand,
      /**
       * @param {SendUserPasswordChangeConfirmationLinkCommand} cmd
       */
      (cmd) => {
        let mailerConfig = config.get('template_mailer')
        return tokens.lostPasswordToken(config.get('api_host'), config.get('private_key'), config.get('token_lifetime'), cmd.user)
          .then((token) => {
            return templateMailerClient
              .send(mailerConfig['transport'], mailerConfig['template_prefix'] + mailerConfig['password_change_template'], cmd.user.email.toString(), cmd.user.name(), {
                recipient: {
                  firstname: cmd.user.firstname,
                  lastname: cmd.user.lastname
                },
                link: config.get('web_host') + config.get('base_href') + '#!/password-change/' + token.token,
                baseHref: config.get('base_href'),
                webHost: config.get('web_host')
              })
              .then(() => {
                return new UserPasswordChangeConfirmationLinkSentEvent(cmd.user, token)
              })
          })
      })
  }
}
