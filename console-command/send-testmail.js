'use strict'

let TemplateMailerClient = require('template-mailer-aws-lambda-client')
let emails = require('transactional-emails')

module.exports = {
  arguments: '<template> <to> <name>',
  description: 'Send a testmail',
  action: (backend, template, to, name) => {
    return emails.load()
      .filter((email) => {
        return email.identifier === template
      })
      .spread((email) => {
        let data = email.defaults
        data.webHost = backend.config.get('web_host')
        return new TemplateMailerClient(backend.config.get('template_mailer:endpoint'), backend.config.get('template_mailer:api_key'))
          .send('networhk', 'networhk-' + template, to, name, data)
          .then(() => {
            console.log('Sent', template, 'to', to)
          })
      })
  }
}
