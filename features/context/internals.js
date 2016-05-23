'use strict'

let Yadda = require('yadda')
let English = Yadda.localisation.English
let dictionary = new Yadda.Dictionary()
let tokens = require('../../util/tokens')
let EmailValue = require('rheactor-value-objects/email')
let utils = require('./util/storage')

module.exports = {
  library: English.library(dictionary)
    .given('I have the $token for "$email" in "$storage"', function (token, email, storage, next) {
      let context = this.ctx
      context.$app.repositories.user.getByEmail(new EmailValue(utils.template(email, utils.data(context))))
        .then((user) => {
          let lifetime = context.$app.config.get('token_lifetime')
          if (/^expired/.test(token)) {
            token = token.replace(/^expired/, '')
            lifetime = -1
          }
          return tokens[token](
            context.$app.config.get('api_host'),
            context.$app.config.get('private_key'),
            lifetime,
            user
          )
        })
        .then((token) => {
          context.data[storage] = token.token
          next()
        })
    })
}
