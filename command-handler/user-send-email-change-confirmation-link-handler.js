'use strict'

let SendUserEmailChangeConfirmationLinkCommand = require('../command/user/send-email-change-confirmation-link')
let UserEmailChangeConfirmationLinkSentEvent = require('../event/user/email-change-confirmation-link-sent')
let tokens = require('../util/tokens')

/**
 * Send a email reset token if requested
 *
 * @param {TemplateMailerClient} templateMailerClient
 * @param {Object} config
 * @param {Object} webConfig
 */
module.exports = (templateMailerClient, config, webConfig) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(SendUserEmailChangeConfirmationLinkCommand,
      /**
       * @param {SendUserEmailChangeConfirmationLinkCommand} cmd
       */
      (cmd) => {
        let mailerConfig = config.get('template_mailer')
        return tokens.changeEmailToken(config.get('api_host'), config.get('private_key'), config.get('token_lifetime'), cmd.user, {email: cmd.email.toString()})
          .then((token) => {
            return templateMailerClient
              .send(mailerConfig['transport'], mailerConfig['template_prefix'] + mailerConfig['email_change_template'], cmd.email.toString(), cmd.user.name(), {
                recipient: {
                  firstname: cmd.user.firstname,
                  lastname: cmd.user.lastname
                },
                link: config.get('web_host') + webConfig.baseHref + '#!/account/email-change/' + token.token,
                baseHref: webConfig.baseHref,
                webHost: config.get('web_host')
              })
              .then(() => {
                return new UserEmailChangeConfirmationLinkSentEvent(cmd.user, cmd.email, token)
              })
          })
      })
  }
}
