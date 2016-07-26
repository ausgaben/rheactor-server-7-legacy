'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @constructor
 */
function SuperUserPermissionsGrantedEvent (aggregateId) {
  ModelEvent.call(this, aggregateId, SuperUserPermissionsGrantedEvent.name, {}, Date.now())
}
util.inherits(SuperUserPermissionsGrantedEvent, ModelEvent)

module.exports = SuperUserPermissionsGrantedEvent
