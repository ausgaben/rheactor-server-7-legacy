'use strict'

const passport = require('passport')
const BearerStrategy = require('passport-http-bearer').Strategy
const JSONLD = require('../jsonld')
const tokens = require('../../util/tokens')
const ModelTransformer = require('../../api/transformer')
const rheactorExpressBaseConfig = require('./base')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param repositories
 * @param {BackendEmitter} emitter
 * @param {function} transformer
 * @param {JSONLD} jsonld
 */
module.exports = (app, config, repositories, emitter, transformer, jsonld) => {
  if (!jsonld) {
    jsonld = JSONLD(config.get('api_host'))
  }

  if (!transformer) {
    let modelTransformer = new ModelTransformer()
    transformer = (jsonld, model) => {
      return modelTransformer.transform(jsonld, model)
    }
  }

  const base = rheactorExpressBaseConfig(config, app)

  app.use(passport.initialize())
  let verifyToken = (token) => {
    return tokens.verify(config.get('api_host'), config.get('public_key'), token)
  }
  passport.use(new BearerStrategy(
    function (token, cb) {
      return verifyToken(token)
        .then((t) => {
          return cb(null, t.payload.sub_id, t)
        })
        .catch((err) => {
          if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return cb(null, false)
          }
          return cb(err)
        })
    }))
  let tokenAuth = passport.authenticate('bearer', {session: false, failWithError: true})

  require('../../api/route/index')(app, jsonld)
  require('../../api/route/status')(app, config)
  require('../../api/route/registration')(app, config, emitter, repositories.user, base.sendHttpProblem)
  require('../../api/route/token')(app, config, tokenAuth, jsonld, base.sendHttpProblem)
  require('../../api/route/login')(app, config, repositories.user, jsonld, base.sendHttpProblem)
  require('../../api/route/password-change')(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  require('../../api/route/activate-account')(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  require('../../api/route/user')(app, config, repositories.user, tokenAuth, base.sendHttpProblem, transformer.bind(null, jsonld))
  require('../../api/route/avatar')(app, config, emitter, repositories.user, tokenAuth, jsonld, base.sendHttpProblem)

  return {
    jsonld,
    tokenAuth,
    sendHttpProblem: base.sendHttpProblem,
    verifyToken
  }
}
