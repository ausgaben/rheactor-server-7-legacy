'use strict'

const ConflictError = require('rheactor-value-objects/errors/conflict')

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

module.exports = checkVersion
