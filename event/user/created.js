'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @param {Object} data
 * @constructor
 */
function UserCreatedEvent (aggregateId, data) {
  ModelEvent.call(this, aggregateId, UserCreatedEvent.name, data, Date.now())
}
util.inherits(UserCreatedEvent, ModelEvent)

module.exports = UserCreatedEvent
