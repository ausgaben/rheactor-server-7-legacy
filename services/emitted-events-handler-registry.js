'use strict'

let Promise = require('bluebird')

/**
 * @param {BackendEmitter} emitter
 * @constructor
 */
let EmittedEventsHandlerRegistry = function (emitter) {
  this.emitter = emitter
}

/**
 * @param {Object} command
 * @param {Function} handler
 */
EmittedEventsHandlerRegistry.prototype.addHandler = function (command, handler) {
  let self = this
  self.emitter.on(self.emitter.toEventName(command), self.handleCommand.bind(self, handler))
}

/**
 * @param {Function} handler
 * @param {Object} cmd
 */
EmittedEventsHandlerRegistry.prototype.handleCommand = function (handler, cmd) {
  let self = this
  Promise
    .try(() => {
      return handler(cmd)
    })
    .then((result) => {
      // Commands and Events may return other commands or events
      if (!result) {
        return
      }
      if (Array.isArray(result)) {
        Promise.map(result, self.emitter.emit.bind(self.emitter))
      } else {
        self.emitter.emit(result)
      }
      return result
    })
    .then((result) => {
      cmd.resolve(result)
    })
    .catch((err) => {
      self.emitter.emit(err)
      cmd.reject(err)
    })
}

module.exports = EmittedEventsHandlerRegistry
