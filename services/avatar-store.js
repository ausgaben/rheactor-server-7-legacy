'use strict'

let Promise = require('bluebird')
const lwip = Promise.promisifyAll(require('lwip'))
Promise.promisifyAll(require('lwip/lib/Image').prototype)
Promise.promisifyAll(require('lwip/lib/Batch').prototype)
let AWS = require('aws-sdk')

function AvatarStore (config) {
  this.config = config
  this.awsConfig = config.get('aws')
}

AvatarStore.prototype.upload = function (file, userId, type) {
  let self = this
  return lwip.openAsync(file, type)
    .then(image => image.batch().cover(256, 256).toBufferAsync('jpg'))
    .then(imageData => {
      var s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        signatureVersion: 'v4',
        region: self.awsConfig.region,
        accessKeyId: self.awsConfig.access_key_id,
        secretAccessKey: self.awsConfig.secret_access_key,
        params: {
          Bucket: self.awsConfig.avatar_bucket
        }
      })
      var params = {
        Key: self.config.get('environment') + '/' + self.config.get('host') + '/' + userId,
        ContentType: 'image/jpeg',
        Body: imageData
      }
      return s3.putObject(params).promise()
    })
    .then(() => 'https://' + self.awsConfig.avatar_bucket + '.s3.amazonaws.com/' + self.config.get('environment') + '/' + self.config.get('host') + '/' + userId + '?t=' + Date.now())
}

module.exports = AvatarStore
