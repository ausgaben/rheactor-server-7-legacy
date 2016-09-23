'use strict'

const ChangeUserEmailCommand = require('../../../command/user/email-change')
const ConflictError = require('rheactor-value-objects/errors/conflict')

module.exports = {
  command: ChangeUserEmailCommand,
  /**
   * @param {UserRepository} repository
   * @param {ChangeUserEmailCommand} cmd
   * @return {UserEmailChangedEvent}
   */
  handler: (repository, cmd) => repository.findByEmail(cmd.email)
    .then(existingUser => {
      if (existingUser) throw new ConflictError('Email address already in use: ' + cmd.email.toString())
      let event = cmd.user.setEmail(cmd.email)
      return repository.persistEvent(event, cmd.author)
    })
}
