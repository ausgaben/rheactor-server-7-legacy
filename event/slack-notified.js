'use strict'

/**
 * Emitted if the slack channel has been notified about the given event
 * @param {event} event
 * @constructor
 */
function SlackNotified (event) {
  this.event = event
}

module.exports = SlackNotified
