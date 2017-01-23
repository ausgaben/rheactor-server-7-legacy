import Promise from 'bluebird'

/**
 * @param {BackendEmitter} emitter
 * @constructor
 */
export class EmittedEventsHandlerRegistry {
  constructor (emitter) {
    this.emitter = emitter
  }

  /**
   * @param {Object} command
   * @param {Function} handler
   */
  addHandler (command, handler) {
    this.emitter.on(this.emitter.toEventName(command), this.handleCommand.bind(this, handler))
  }

  /**
   * @param {Function} handler
   * @param {Object} cmd
   */
  handleCommand (handler, cmd) {
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
          Promise.map(result, this.emitter.emit.bind(this.emitter))
        } else {
          this.emitter.emit(result)
        }
        return result
      })
      .then((result) => {
        cmd.resolve(result)
      })
      .catch((err) => {
        this.emitter.emit(err)
        cmd.reject(err)
      })
  }
}
