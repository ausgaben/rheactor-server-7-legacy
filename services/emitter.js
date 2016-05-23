'use strict'

var EventEmitter = require('events')
let util = require('util')
let _snakeCase = require('lodash/snakeCase')
let Promise = require('bluebird')

let toEventName = (cmdOrEvent) => {
  if (typeof cmdOrEvent === 'object' && cmdOrEvent.constructor) {
    return _snakeCase(cmdOrEvent.constructor.name)
  }
  return _snakeCase(cmdOrEvent.name)
}

function BackendEmitter () {
  EventEmitter.call(this)
}
util.inherits(BackendEmitter, EventEmitter)

BackendEmitter.prototype.emit = function (cmd) {
  let self = this
  if (!cmd) {
    console.error('BackendEmitter.emit called without cmd')
    return
  }
  let event = toEventName(cmd)
  if (cmd instanceof Error) {
    event = 'error'
  }
  if (this.isVerbose) {
    console.log('BackendEmitter', event)
  }
  cmd.promise = new Promise((resolve, reject) => {
    cmd.resolve = resolve
    cmd.reject = reject
  })
  self.constructor.super_.prototype.emit.call(self, event, cmd)
  self.constructor.super_.prototype.emit.call(self, '*', cmd)
  return cmd.promise
}

BackendEmitter.prototype.toEventName = toEventName

BackendEmitter.prototype.verbose = function () {
  this.isVerbose = true
}

module.exports = new BackendEmitter()
