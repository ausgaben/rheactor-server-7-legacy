'use strict'

let Promise = require('bluebird')
let multer = require('multer')
let UpdateUserAvatarCommand = require('../../command/user/update-avatar')
let URIValue = require('rheactor-value-objects/uri')
let ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
let AvatarStore = require('../../services/avatar-store')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {BackendEmitter} emitter
 * @param {UserRepository} userRepository
 * @param {function} tokenAuth
 * @param {JSONLD} jsonld
 * @param {function} sendHttpProblem
 */
module.exports = (app, config, emitter, userRepository, tokenAuth, jsonld, sendHttpProblem) => {
  let upload = multer({dest: config.get('uploads_location')})
  let avatarStore = new AvatarStore(config)

  app.post('/api/avatar', tokenAuth, upload.single('file'), (req, res) => {
    let user
    Promise
      .try(() => {
        if (!req.file.path) {
          throw new ValidationFailedError('No file uploaded!')
        }
      })
      .then(() => {
        return userRepository.getById(req.user)
      })
      .then((u) => {
        user = u
      })
      .then(() => {
        let type
        switch (req.file.mimetype) {
          case 'image/jpeg':
            type = 'jpg'
            break
          case 'image/png':
            type = 'png'
            break
          default:
            throw new ValidationFailedError('Unsupported mime type', req.file.mimetype)
        }
        return avatarStore.upload(req.file.path, req.user, type)
      })
      .then((url) => {
        return emitter.emit(new UpdateUserAvatarCommand(user, new URIValue(url)))
          .then(() => {
            return url
          })
      })
      .then((url) => {
        return res
          .status(201)
          .send({
            url
          })
      })
      .catch(sendHttpProblem.bind(null, res))
  })
}
