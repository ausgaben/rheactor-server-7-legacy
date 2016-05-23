'use strict'

let CreateUserCommand = require('../command/user/create')
let EmailValue = require('rheactor-value-objects/email')
let URIValue = require('rheactor-value-objects/uri')
let Promise = require('bluebird')
let bcrypt = require('bcrypt')
Promise.promisifyAll(bcrypt)

module.exports = {
  arguments: '<email> <firstname> <lastname> [avatar]',
  description: 'creates a new new user',
  action: (backend, email, firstname, lastname, avatar) => {
    return bcrypt
      .genSaltAsync(backend.config.get('bcrypt_rounds'))
      .then(bcrypt.hashAsync.bind(bcrypt, '12345678'))
      .then((hashedPassword) => {
        if (avatar) {
          avatar = new URIValue(avatar)
        }
        return backend.emitter.emit(new CreateUserCommand(new EmailValue(email), firstname, lastname, hashedPassword, true, avatar))
          .then((event) => {
            console.log('User created', event.user.name(), event.user.email.toString())
            console.log('Password is 12345678')
          })
      })
  }
}
