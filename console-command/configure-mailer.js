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
      mailer.config('networhk', mailerConfig.credentials, mailerConfig.from, mailerConfig.name)
        .then(() => {
          console.log('Updated smtp configuration: networhk')
        }),
      emails.load()
        .map((email) => {
          return mailer.template('networhk-' + email.identifier, email.subject, email.html, email.text)
            .then(function () {
              console.log('Updated template mailer template:', email.identifier)
            })
        })
    )
  }
}
