'use strict'

let TemplateMailerClient = require('template-mailer-aws-lambda-client')
let emails = require('transactional-emails')

module.exports = {
  arguments: '<template> <to> <name>',
  description: 'Send a testmail',
  action: (backend, template, to, name) => {
    let mailerConfig = backend.config.get('template_mailer')
    return emails.load()
      .filter((email) => {
        return email.identifier === template
      })
      .spread((email) => {
        let data = email.defaults
        data.webHost = backend.config.get('web_host')
        return new TemplateMailerClient(mailerConfig['endpoint'], mailerConfig['api_key'])
          .send(mailerConfig['smtp_config'], mailerConfig['template_prefix'] + template, to, name, data)
          .then(() => {
            console.log('Sent', template, 'to', to)
          })
      })
  }
}
