'use strict'

const UpdateUserAvatarCommand = require('../command/user/update-avatar')
const DeactivateUserCommand = require('../command/user/deactivate')
const URIValue = require('rheactor-value-objects/uri')
const Promise = require('bluebird')

module.exports = {
  arguments: '<email>',
  description: 'Update user properties',
  options: [
    ['-a, --avatar <url>', 'Set the avatar'],
    ['-d, --deactivate', 'Deactivated the user']
  ],
  action: (backend, email, options) => {
    return backend.repositories.user.getByEmail(email)
      .then((user) => {
        const p = []
        if (options.avatar) {
          p.push(backend.emitter.emit(new UpdateUserAvatarCommand(user, new URIValue(options.avatar))))
        }
        if (options.deactivate) {
          p.push(backend.emitter.emit(new DeactivateUserCommand(user)))
        }
        return Promise.all(p)
      })
  }
}
