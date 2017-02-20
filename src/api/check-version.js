import {ConflictError} from '@resourcefulhumans/rheactor-errors'
import {AggregateRootType} from 'rheactor-event-store'
import {PositiveIntegerType} from '../util/pagination'

/**
 * @param {Number} theirVersion
 * @param {AggregateRoot} model
 * @throws {ConflictError}
 */
export function checkVersion (theirVersion, model) {
  theirVersion = +theirVersion
  PositiveIntegerType(theirVersion, ['checkVersion()', 'theirVersion:Integer > 0'])
  AggregateRootType(model, ['checkVersion()', 'model:AggregateRoot'])
  let ourVersion = model.aggregateVersion()
  if (theirVersion !== ourVersion) {
    throw new ConflictError(model.constructor.name + ' "' + model.aggregateId() + '" has been modified. ' +
      'Your version is ' + theirVersion +
      ' our version is ' + ourVersion
    )
  }
}
