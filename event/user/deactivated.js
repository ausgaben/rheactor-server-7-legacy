'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @constructor
 */
function UserDeactivatedEvent (aggregateId) {
  ModelEvent.call(this, aggregateId, UserDeactivatedEvent.name, {}, Date.now())
}
util.inherits(UserDeactivatedEvent, ModelEvent)

module.exports = UserDeactivatedEvent
