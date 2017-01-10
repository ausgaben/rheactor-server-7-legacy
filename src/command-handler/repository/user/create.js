import CreateUserCommand from '../../../command/user/create'
import {UserModel} from '../../../model/user'

export default {
  command: CreateUserCommand,
  /**
   * @param {UserRepository} repository
   * @param {CreateUserCommand} cmd
   * @return {UserCreatedEvent}
   */
  handler: (repository, cmd) => repository.add(new UserModel(cmd.email, cmd.firstname, cmd.lastname, cmd.password, cmd.active, cmd.avatar), cmd.author)
}
