'use strict'

/**
 * @param {UserModel} user
 * @param {String} email
 * @param {UserModel} author
 * @constructor
 */
function ChangeUserEmailCommand (user, email, author) {
  this.user = user
  this.email = email
  this.author = author
}

module.exports = ChangeUserEmailCommand
