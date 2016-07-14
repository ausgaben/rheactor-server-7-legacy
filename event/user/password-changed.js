'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @param {Object} data
 * @constructor
 */
function UserPasswordChangedEvent (aggregateId, data) {
  ModelEvent.call(this, aggregateId, UserPasswordChangedEvent.name, data, Date.now())
}
util.inherits(UserPasswordChangedEvent, ModelEvent)

module.exports = UserPasswordChangedEvent
