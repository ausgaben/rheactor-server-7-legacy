'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {ModelEvent} modelEvent
 * @constructor
 */
function UserActivatedEvent (modelEvent) {
  ModelEvent.call(this, modelEvent.aggregateId, this.constructor.name, modelEvent.data, modelEvent.createdAt, modelEvent.createdBy)
}
util.inherits(UserActivatedEvent, ModelEvent)

module.exports = UserActivatedEvent
