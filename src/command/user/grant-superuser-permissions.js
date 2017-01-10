import {UserModelType} from '../../model/user'

/**
 * @param {UserModel} user
 * @param {UserModel} author
 * @constructor
 */
function GrantSuperUserPermissionCommand (user, author) {
  UserModelType(user)
  UserModelType(author)
  this.user = user
  this.author = author
}

export default GrantSuperUserPermissionCommand
