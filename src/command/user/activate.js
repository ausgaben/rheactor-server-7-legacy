import {UserModelType} from '../../model/user'

/**
 * @param {UserModel} user
 * @param {UserModel} author
 * @constructor
 */
export default function ActivateUserCommand (user, author) {
  UserModelType(user)
  UserModelType(author)
  this.user = user
  this.author = author
}
