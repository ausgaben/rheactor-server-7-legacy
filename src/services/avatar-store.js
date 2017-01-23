import Promise from 'bluebird'
import lwip from 'lwip'
import AWS from 'aws-sdk'
import Image from 'lwip/lib/Image'
import Batch from 'lwip/lib/Batch'
Promise.promisifyAll(lwip)
Promise.promisifyAll(Image.prototype)
Promise.promisifyAll(Batch.prototype)

export class AvatarStore {
  constructor (config) {
    this.config = config
    this.awsConfig = config.get('aws')
  }

  upload (file, userId, type) {
    return lwip.openAsync(file, type)
      .then(image => image.batch().cover(256, 256).toBufferAsync('jpg'))
      .then(imageData => {
        const s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          signatureVersion: 'v4',
          region: this.awsConfig.region,
          accessKeyId: this.awsConfig.access_key_id,
          secretAccessKey: this.awsConfig.secret_access_key,
          params: {
            Bucket: this.awsConfig.avatar_bucket
          }
        })
        const params = {
          Key: `${this.config.get('environment')}/${this.config.get('host')}/${userId}`,
          ContentType: 'image/jpeg',
          Body: imageData
        }
        return s3.putObject(params).promise()
      })
      .then(() => `https://${this.awsConfig.avatar_bucket}.s3.amazonaws.com/${this.config.get('environment')}/${this.config.get('host')}/${userId}?t=${Date.now()}`)
  }
}
