import Promise from 'bluebird'
import redis from 'redis'
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

function RedisConnection (host, port, database, password) {
  this.host = host || '127.0.0.1'
  this.port = port || '6379'
  this.database = database || 0
  this.password = password || false
}

RedisConnection.prototype.connect = function () {
  let self = this
  return Promise.try(() => {
    const opts = {host: this.host, port: this.port}
    if (this.password) opts.password = this.password
    this.client = redis.createClient(opts)
    if (!self.database) {
      return self.client
    }
    return self.client.selectAsync(self.database)
      .then(() => {
        return self.client
      })
  })
}

export default RedisConnection
