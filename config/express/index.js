'use strict'

const passport = require('passport')
const BearerStrategy = require('passport-http-bearer').Strategy
const tokenBearerStrategy = require('./token-bearer-strategy')
const JSONLD = require('../jsonld')
const tokens = require('../../util/tokens')
const ModelTransformer = require('../../api/transformer')
const rheactorExpressBaseConfig = require('./base')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {ojbect} webConfig
 * @param repositories
 * @param {BackendEmitter} emitter
 * @param {function} transformer
 * @param {JSONLD} jsonld
 */
module.exports = (app, config, webConfig, repositories, emitter, transformer, jsonld) => {
  if (!jsonld) {
    jsonld = JSONLD(config.get('api_host'))
  }

  if (!transformer) {
    let modelTransformer = new ModelTransformer()
    transformer = (jsonld, model) => {
      return modelTransformer.transform(jsonld, model)
    }
  }

  const base = rheactorExpressBaseConfig(config, webConfig, app)

  app.use(passport.initialize())
  let verifyToken = (token) => {
    return tokens.verify(config.get('api_host'), config.get('public_key'), token)
  }
  passport.use(new BearerStrategy(tokenBearerStrategy(verifyToken)))
  let tokenAuth = passport.authenticate('bearer', {session: false, failWithError: true})

  require('../../api/route/index')(app, jsonld)
  require('../../api/route/status')(app, config)
  require('../../api/route/registration')(app, config, emitter, repositories.user, base.sendHttpProblem)
  require('../../api/route/token')(app, config, tokenAuth, jsonld, base.sendHttpProblem)
  require('../../api/route/login')(app, config, repositories.user, jsonld, base.sendHttpProblem)
  require('../../api/route/password-change')(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  require('../../api/route/profile')(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  require('../../api/route/activate-account')(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  require('../../api/route/user')(app, config, emitter, repositories.user, tokenAuth, jsonld, base.sendHttpProblem, transformer.bind(null, jsonld))

  return {
    jsonld,
    tokenAuth,
    sendHttpProblem: base.sendHttpProblem,
    verifyToken
  }
}
