import {ConflictError} from '@resourcefulhumans/rheactor-errors'

/**
 * @param {Number} theirVersion
 * @param {AggregateRoot} model
 * @throws {ConflictError}
 */
let checkVersion = (theirVersion, model) => {
  theirVersion = +theirVersion
  let ourVersion = +model.aggregateVersion()
  if (theirVersion !== ourVersion) {
    throw new ConflictError(model.constructor.name + ' "' + model.aggregateId() + '" has been modified. ' +
      'Your version is ' + theirVersion +
      ' our version is ' + ourVersion
    )
  }
}

export default checkVersion
