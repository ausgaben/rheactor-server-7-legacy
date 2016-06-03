'use strict'

let Promise = require('bluebird')
let TemplateMailerClient = require('template-mailer-aws-lambda-client')
let emails = require('transactional-emails')

module.exports = {
  description: 'Configure the template mailer',
  action: (backend) => {
    let mailerConfig = backend.config.get('template_mailer')
    let mailer = new TemplateMailerClient(mailerConfig.endpoint, mailerConfig.api_key)
    return Promise.join(
      mailer.config(mailerConfig['smtp_config'], mailerConfig.credentials, mailerConfig.from, mailerConfig.name)
        .then(() => {
          console.log('Updated smtp configuration:', mailerConfig['smtp_config'])
        }),
      emails.load()
        .map((email) => {
          return mailer.template(mailerConfig['template_prefix'] + email.identifier, email.subject, email.html, email.text)
            .then(function () {
              console.log('Updated template mailer template:', email.identifier)
            })
        })
    )
  }
}
