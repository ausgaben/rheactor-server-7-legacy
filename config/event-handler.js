'use strict'

let EmittedEventsHandlerRegistry = require('../services/emitted-events-handler-registry')

/**
 * @param {Array.<AggregateRepository>} repos
 * @param {BackendEmitter} emitter
 */
module.exports = (repos, emitter) => {
  let c = new EmittedEventsHandlerRegistry(emitter)
  require('../event-handler/send-email-confirmation')()(c)
}
