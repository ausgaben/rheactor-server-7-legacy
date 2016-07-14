'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @constructor
 */
function UserActivatedEvent (aggregateId) {
  ModelEvent.call(this, aggregateId, UserActivatedEvent.name, {}, Date.now())
}
util.inherits(UserActivatedEvent, ModelEvent)

module.exports = UserActivatedEvent
