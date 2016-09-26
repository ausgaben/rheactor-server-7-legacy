'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @param {String} property
 * @param {Object} value
 * @constructor
 */
function UserPropertyChangedEvent (aggregateId, property, value) {
  ModelEvent.call(this, aggregateId, UserPropertyChangedEvent.name, {property, value}, Date.now())
}
util.inherits(UserPropertyChangedEvent, ModelEvent)

module.exports = UserPropertyChangedEvent
