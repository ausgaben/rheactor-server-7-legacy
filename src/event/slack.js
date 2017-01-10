/**
 * Emitted if the slack channel has been notified about the given event
 * @param {event} event
 * @constructor
 */
export function SlackNotified (event) {
  this.event = event
}
