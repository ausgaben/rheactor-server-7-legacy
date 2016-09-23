'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @param {Object} data
 * @constructor
 */
function UserEmailChangedEvent (aggregateId, data) {
  ModelEvent.call(this, aggregateId, UserEmailChangedEvent.name, data, Date.now())
}
util.inherits(UserEmailChangedEvent, ModelEvent)

module.exports = UserEmailChangedEvent
