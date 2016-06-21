'use strict'

let CreateUserCommand = require('../../../command/user/create')
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
    return repository.add(user)
  }
}
