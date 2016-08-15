'use strict'

let ConfirmUserEmailCommand = require('../command/user/confirm-email')
let UserActivationLinkSentEvent = require('../event/user/activation-link-sent')
let tokens = require('../util/tokens')

/**
 * Send an email confirmation mail to the user
 *
 * @param {TemplateMailerClient} templateMailerClient
 * @param {object} config
 */
module.exports = (templateMailerClient, config) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(ConfirmUserEmailCommand,
      /**
       * @param {ConfirmUserEmailCommand} cmd
       */
      (cmd) => {
        let mailerConfig = config.get('template_mailer')
        return tokens.accountActivationToken(config.get('api_host'), config.get('private_key'), config.get('activation_token_lifetime'), cmd.user)
          .then((token) => {
            return templateMailerClient
              .send(mailerConfig['smtp_config'], mailerConfig['template_prefix'] + mailerConfig['email_verification_template'], cmd.email.toString(), cmd.user.name(), {
                recipient: {
                  firstname: cmd.user.firstname,
                  lastname: cmd.user.lastname
                },
                link: config.get('web_host') + config.get('base_href') + '#!/activate/' + token.token,
                baseHref: config.get('base_href'),
                webHost: config.get('web_host')
              })
              .then(() => {
                return new UserActivationLinkSentEvent(cmd.user, token)
              })
          })
      })
  }
}
