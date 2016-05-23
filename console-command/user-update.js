'use strict'

let UpdateUserAvatarCommand = require('../command/user/update-avatar')
let URIValue = require('rheactor-value-objects/uri')

module.exports = {
  arguments: '<email>',
  description: 'Update user properties',
  options: [
    ['-a, --avatar <url>', 'Set the avatar']
  ],
  action: (backend, email, options) => {
    return backend.repositories.user.getByEmail(email)
      .then((user) => {
        if (options.avatar) {
          return backend.emitter.emit(new UpdateUserAvatarCommand(user, new URIValue(options.avatar)))
        }
      })
  }
}
