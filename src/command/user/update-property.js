import {UserModelType} from '../../model/user'
import {String as StringType, Any as AnyType} from 'tcomb'

/**
 * @param {UserModel} user
 * @param {String} property
 * @param {*} value
 * @param {UserModel} author
 * @constructor
 */
function UpdateUserPropertyCommand (user, property, value, author) {
  UserModelType(user)
  StringType(property)
  AnyType(property)
  UserModelType(author)
  this.user = user
  this.property = property
  this.value = value
  this.author = author
}

export default UpdateUserPropertyCommand
