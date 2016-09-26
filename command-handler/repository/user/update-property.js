'use strict'

const UpdateUserPropertyCommand = require('../../../command/user/update-property')
const ApplicationError = require('rheactor-value-objects/errors/application')

module.exports = {
  command: UpdateUserPropertyCommand,
  /**
   * @param {UserRepository} repository
   * @param {UpdateUserPropertyCommand} cmd
   * @return {UserEmailChangedEvent}
   */
  handler: (repository, cmd) => {
    /**
     * Helper method to manipulate the property of the user model
     *
     * @param {function} setter Function to set the new value
     */
    const updateProperty = (setter) => {
      const event = setter(cmd)
      return repository.persistEvent(event, cmd.author)
    }
    switch (cmd.property) {
      case 'firstname':
        return updateProperty(cmd => cmd.user.setFirstname(cmd.value))
      case 'lastname':
        return updateProperty(cmd => cmd.user.setLastname(cmd.value))
      default:
        throw new ApplicationError('Changing of "' + cmd.property + '" on users not supported!')
    }
  }
}
