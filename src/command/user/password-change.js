import {UserModelType} from '../../model/user'
import {String as StringType} from 'tcomb'

/**
 * @param {UserModel} user
 * @param {String} password
 * @param {UserModel} author
 * @constructor
 */
function ChangeUserPasswordCommand (user, password, author) {
  UserModelType(user)
  StringType(password)
  UserModelType(author)
  this.user = user
  this.password = password
  this.author = author
}

export default ChangeUserPasswordCommand
