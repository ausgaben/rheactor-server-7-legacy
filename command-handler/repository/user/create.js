'use strict'

let CreateUserCommand = require('../../../command/user/create')
let UserCreatedEvent = require('../../../event/user/created')
let UserModel = require('../../../model/user')

module.exports = {
  command: CreateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {CreateUserCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => {
    let user = new UserModel(cmd.email, cmd.firstname, cmd.lastname, cmd.password, cmd.active, cmd.avatar)
    return repository.create(user)
      .then((id) => {
        user.persisted(id)
        return new UserCreatedEvent(user)
      })
  }
}
