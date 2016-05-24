'use strict'

let bodyParser = require('body-parser')
let HttpProblem = require('rheactor-web-app/js/model/http-problem')
let passport = require('passport')
let BearerStrategy = require('passport-http-bearer').Strategy
let JSONLD = require('../config/jsonld')
let tokens = require('../util/tokens')
let cors = require('cors')
let ModelTransformer = require('../api/transformer')

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param repositories
 * @param {BackendEmitter} emitter
 * @param {function} transformer
 * @param {JSONLD} jsonld
 */
module.exports = (app, config, repositories, emitter, transformer, jsonld) => {
  require('fast-url-parser').replace()

  app.enable('trust proxy')
  app.use(bodyParser.json({type: config.get('mime_type')}))

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

  if (!jsonld) {
    jsonld = JSONLD(config.get('api_host'))
  }

  app.use(cors({
    origin: config.get('web_host'),
    exposedHeaders: [
      'cache-control',
      'connection',
      'content-length',
      'content-type',
      'location',
      'x-networhk-version',
      'x-networhk-deployversion',
      'x-networhk-environment'
    ]
  }))

  // Disable caching by default
  app.set('etag', false)
  app.use((req, res, next) => {
    res.header('Cache-Control', 'max-age=0, private')
    next()
  })

  // Set content type
  const CONTENT_TYPE = config.get('mime_type') + '; charset=utf-8'
  app.use((req, res, next) => {
    res.header('Content-Type', CONTENT_TYPE)
    next()
  })

  let environment = config.get('environment')
  let sendHttpProblem = require('../api/send-http-problem').bind(null, environment)
  if (!transformer) {
    let modelTransformer = new ModelTransformer()
    transformer = (jsonld, model) => {
      return modelTransformer.transform(jsonld, model)
    }
  }

  require('../api/route/index')(app, jsonld)
  require('../api/route/status')(app, config)
  require('../api/route/registration')(app, config, emitter, repositories.user, sendHttpProblem)
  require('../api/route/token')(app, config, tokenAuth, jsonld, sendHttpProblem)
  require('../api/route/login')(app, config, repositories.user, jsonld, sendHttpProblem)
  require('../api/route/password-change')(app, config, emitter, repositories.user, tokenAuth, sendHttpProblem)
  require('../api/route/activate-account')(app, config, emitter, repositories.user, tokenAuth, sendHttpProblem)
  require('../api/route/user')(app, config, repositories.user, tokenAuth, sendHttpProblem, transformer.bind(null, jsonld))
  require('../api/route/avatar')(app, config, emitter, repositories.user, tokenAuth, jsonld, sendHttpProblem)

  app.use(function (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    if (err.name === 'AuthenticationError') {
      return res
        .status(401)
        .send(HttpProblem.fromException(err, 401))
    }
    console.error(err.name)
    console.error(req.method + ' ' + req.url)
    console.error(err.message)
    console.error(err.stack)
    return res.status(500)
      .send(HttpProblem.fromException(err, 500))
  })

  return {
    jsonld,
    tokenAuth,
    sendHttpProblem,
    verifyToken
  }
}
