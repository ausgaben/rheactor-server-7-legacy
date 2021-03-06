'use strict'

let EmittedEventsHandlerRegistry = require('../services/emitted-events-handler-registry')
let URIValue = require('rheactor-value-objects/uri')

/**
 * @param {Array.<AggregateRepository>} repos
 * @param {BackendEmitter} emitter
 * @param {nconf} config
 */
module.exports = (repos, emitter, config) => {
  let c = new EmittedEventsHandlerRegistry(emitter)
  require('../event-handler/send-email-confirmation')(repos.user)(c)
  let slackWebhook = config.get('slack:webhook')
  if (slackWebhook && config.get('environment') !== 'testing') {
    require('../event-handler/notify-slack-about-new-users')(new URIValue(slackWebhook), config.get('app'), repos.user)(c)
  }
}
