'use strict'

let Promise = require('bluebird')
let gm = require('gm')
Promise.promisifyAll(gm.prototype)
let fs = require('fs')
let AWS = require('aws-sdk')
let Errors = require('rheactor-value-objects/errors')

function AvatarStore (config) {
  this.config = config
  this.awsConfig = config.get('aws')
}

AvatarStore.prototype.upload = function (file, userId) {
  let self = this
  let mimetype
  return Promise
    .try(() => {
      let f = gm(file)
      return f.identifyAsync()
        .then((res) => {
          switch (res.format) {
            case 'JPEG':
              mimetype = 'image/jpeg'
              break
            case 'PNG':
              mimetype = 'image/png'
              break
            default:
              throw new Errors.ValidationFailedException('Unsupported mime type', res.format)
          }
          return f
        })
    })
    .then((f) => {
      return f
        .autoOrient()
        .resize(256, 256, '^')
        .gravity('Center')
        .crop(256, 256)
        .writeAsync(file)
    })
    .then(() => {
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
        ContentType: mimetype,
        Body: fs.createReadStream(file)
      }
      return s3.putObject(params).promise()
    })
    .then(() => {
      return 'https://' + self.awsConfig.avatar_bucket + '.s3.amazonaws.com/' + self.config.get('environment') + '/' + self.config.get('host') + '/' + userId + '?t=' + Date.now()
    })
}

module.exports = AvatarStore
