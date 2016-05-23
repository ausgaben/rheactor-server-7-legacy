'use strict'

/**
 * @param {EmailValue} email
 * @param {String} firstname
 * @param {String} lastname
 * @param {String} password
 * @param {Boolean} active
 * @param {URIValue} avatar
 * @constructor
 */
function CreateUserCommand (email, firstname, lastname, password, active, avatar) {
  this.email = email
  this.firstname = firstname
  this.lastname = lastname
  this.password = password
  this.active = active || false
  this.avatar = avatar
}

module.exports = CreateUserCommand
