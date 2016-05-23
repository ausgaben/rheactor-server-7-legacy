'use strict'

let Promise = require('bluebird')

module.exports = {
  arguments: '[name]',
  description: 'Print configuration',
  action: (backend, name) => {
    return Promise.try(() => {
      console.log(backend.config.get(name))
    })
  }
}
