'use strict'

const UpdateUserAvatarCommand = require('../command/user/update-avatar')
const ChangeUserEmailCommand = require('../command/user/email-change')
const DeactivateUserCommand = require('../command/user/deactivate')
const ActivateUserCommand = require('../command/user/activate')
const GrantSuperUserPermissionCommand = require('../command/user/grant-superuser-permissions')
const RevokeSuperUserPermissionCommand = require('../command/user/revoke-superuser-permissions')
const URIValue = require('rheactor-value-objects/uri')
const EmailValue = require('rheactor-value-objects/email')
const Promise = require('bluebird')

module.exports = {
  arguments: '<email>',
  description: 'Update user properties',
  options: [
    ['-a, --avatar <url>', 'Set the avatar'],
    ['-e, --email <email>', 'Set the email'],
    ['-d, --deactivate', 'Deactivate the user'],
    ['-A, --activate', 'Activate the user'],
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
        if (options.email) {
          p.push(backend.emitter.emit(new ChangeUserEmailCommand(user, new EmailValue(options.email))))
        }
        if (options.deactivate) {
          p.push(backend.emitter.emit(new DeactivateUserCommand(user)))
        }
        if (options.activate) {
          p.push(backend.emitter.emit(new ActivateUserCommand(user)))
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
