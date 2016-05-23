'use strict'

let Promise = require('bluebird')
let redis = require('redis')
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

function RedisConnection (host, port, database) {
  this.host = host || '127.0.0.1'
  this.port = port || '6379'
  this.database = database || 0
}

RedisConnection.prototype.connect = function () {
  let self = this
  return Promise.try(() => {
    this.client = redis.createClient({host: this.host, port: this.port})
    if (!self.database) {
      return self.client
    }
    return self.client.selectAsync(self.database)
      .then(() => {
        return self.client
      })
  })
}

module.exports = RedisConnection
