import {User} from 'rheactor-models'
import {JSONLDType} from './jsonld'
import {AggregateRootType} from 'rheactor-event-store'

/**
 * @param {JSONLD} jsonld
 * @param {AggregateRoot} model
 */
export function transform (jsonld, model) {
  JSONLDType(jsonld)
  AggregateRootType(model)
  switch (model.constructor.name) {
    case 'UserModel':
      return new User({
        $id: jsonld.createId(User.$context, model.aggregateId()).toString(),
        $version: model.aggregateVersion(),
        $links: jsonld.createLinks(User.$context, model.aggregateId()),
        $createdAt: model.createdAt(),
        $updatedAt: model.updatedAt(),
        $deletedAt: model.deletedAt(),
        firstname: model.firstname,
        lastname: model.lastname,
        email: model.email,
        avatar: model.avatar ? model.avatar : undefined,
        superUser: model.superUser,
        active: model.isActive
      })
  }
}
