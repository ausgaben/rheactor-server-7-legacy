'use strict'

/**
 * @param {UserModel} user
 * @param {string} property
 * @param {object} value
 * @param {UserModel} author
 * @constructor
 */
function UpdateUserPropertyCommand (user, property, value, author) {
  this.user = user
  this.property = property
  this.value = value
  this.author = author
}

module.exports = UpdateUserPropertyCommand
