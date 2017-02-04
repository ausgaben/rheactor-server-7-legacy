import {UserModelType} from '../../model/user'

export class GrantSuperUserPermissionsCommand {
  /**
   * @param {UserModel} user
   * @param {UserModel} author
   */
  constructor (user, author) {
    UserModelType(user)
    UserModelType(author)
    this.user = user
    this.author = author
  }
}
