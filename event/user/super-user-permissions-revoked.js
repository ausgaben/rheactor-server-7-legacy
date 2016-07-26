'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @constructor
 */
function SuperUserPermissionsRevokedEvent (aggregateId) {
  ModelEvent.call(this, aggregateId, SuperUserPermissionsRevokedEvent.name, {}, Date.now())
}
util.inherits(SuperUserPermissionsRevokedEvent, ModelEvent)

module.exports = SuperUserPermissionsRevokedEvent
