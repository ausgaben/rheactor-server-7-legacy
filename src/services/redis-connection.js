import Promise from 'bluebird'
import redis from 'redis'
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

export class RedisConnection {
  constructor (host, port, database, password) {
    this.host = host || '127.0.0.1'
    this.port = port || '6379'
    this.database = database || 0
    this.password = password || false
  }

  connect () {
    return Promise.try(() => {
      const opts = {host: this.host, port: this.port}
      if (this.password) opts.password = this.password
      this.client = redis.createClient(opts)
      if (!this.database) {
        return this.client
      }
      return this.client.selectAsync(this.database)
        .then(() => {
          return this.client
        })
    })
  }
}
