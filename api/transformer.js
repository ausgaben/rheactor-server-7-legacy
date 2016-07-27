'use strict'

let User = require('rheactor-web-app/js/model/user')

/**
 * @constructor
 */
let ModelTransformer = function () {
}

/**
 * @param {JSONLD} jsonld
 * @param {AggregateRoot} model
 */
ModelTransformer.prototype.transform = function (jsonld, model) {
  switch (model.constructor.name) {
    case 'UserModel':
      return new User({
        $id: jsonld.createId(User.$context, model.aggregateId()),
        $version: model.aggregateVersion(),
        $links: jsonld.createLinks(User.$context, model.aggregateId()),
        $createdAt: model.createdAt(),
        $updatedAt: model.updatedAt(),
        $deletedAt: model.deletedAt(),
        firstname: model.firstname,
        lastname: model.lastname,
        email: model.email.toString(),
        avatar: model.avatar ? model.avatar.toString() : undefined,
        superUser: model.superUser,
        active: model.active
      })
  }
}

module.exports = ModelTransformer
