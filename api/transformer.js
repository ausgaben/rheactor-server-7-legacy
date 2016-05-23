'use strict'

let User = require('rheactor-web-app/js/model/user')

module.exports = {
  /**
   * @param {UserModel} user
   * @param {jsonld} jsonld
   * @returns {User}
   */
  user: (user, jsonld) => {
    return new User({
      $id: jsonld.createId(User.$context, user.aggregateId()),
      $version: user.aggregateVersion(),
      $links: jsonld.createLinks(User.$context, user.aggregateId()),
      $createdAt: user.createdAt(),
      $updatedAt: user.updatedAt(),
      $deletedAt: user.deletedAt(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email.toString(),
      avatar: user.avatar ? user.avatar.toString() : undefined
    })
  }
}
