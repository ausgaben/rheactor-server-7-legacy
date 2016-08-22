'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {ModelEvent} modelEvent
 * @constructor
 */
function UserDeactivatedEvent (modelEvent) {
  ModelEvent.call(this, modelEvent.aggregateId, this.constructor.name, modelEvent.data, modelEvent.createdAt, modelEvent.createdBy)
}
util.inherits(UserDeactivatedEvent, ModelEvent)

module.exports = UserDeactivatedEvent
