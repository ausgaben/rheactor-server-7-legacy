'use strict'

const UpdateUserAvatarCommand = require('../command/user/update-avatar')
const DeactivateUserCommand = require('../command/user/deactivate')
const GrantSuperUserPermissionCommand = require('../command/user/grant-superuser-permissions')
const RevokeSuperUserPermissionCommand = require('../command/user/revoke-superuser-permissions')
const URIValue = require('rheactor-value-objects/uri')
const Promise = require('bluebird')

module.exports = {
  arguments: '<email>',
  description: 'Update user properties',
  options: [
    ['-a, --avatar <url>', 'Set the avatar'],
    ['-d, --deactivate', 'Deactivated the user'],
    ['-s, --superuser', 'Grant superUser permissions'],
    ['-n, --nosuperuser', 'Remove superUser permissions']
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
        if (options.superuser) {
          p.push(backend.emitter.emit(new GrantSuperUserPermissionCommand(user)))
        }
        if (options.nosuperuser) {
          p.push(backend.emitter.emit(new RevokeSuperUserPermissionCommand(user)))
        }
        return Promise.all(p)
      })
  }
}
