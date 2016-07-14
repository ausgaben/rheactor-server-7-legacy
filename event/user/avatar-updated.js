'use strict'

const util = require('util')
const ModelEvent = require('rheactor-event-store/model-event')

/**
 * @param {String} aggregateId
 * @param {Object} data
 * @constructor
 */
function UserAvatarUpdatedEvent (aggregateId, data) {
  ModelEvent.call(this, aggregateId, UserAvatarUpdatedEvent.name, data, Date.now())
}
util.inherits(UserAvatarUpdatedEvent, ModelEvent)

module.exports = UserAvatarUpdatedEvent
