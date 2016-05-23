'use strict'

let Promise = require('bluebird')
let multer = require('multer')
let UpdateUserAvatarCommand = require('../../command/user/update-avatar')
let URIValue = require('rheactor-value-objects/uri')
let Errors = require('rheactor-value-objects/errors')
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
          throw new Errors.ValidationFailedException('No file uploaded!')
        }
      })
      .then(() => {
        return userRepository.getById(req.user)
      })
      .then((u) => {
        user = u
      })
      .then(() => {
        return avatarStore.upload(req.file.path, req.user)
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
