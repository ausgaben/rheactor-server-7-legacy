'use strict'

const bodyParser = require('body-parser')
const HttpProblem = require('rheactor-web-app/js/model/http-problem')
const cors = require('cors')
const sendHttpProblemFunc = require('../../api/send-http-problem')

/**
 * @param {nconf} config
 * @param {express.app} app
 * @returns {{sendHttpProblem: <function>}}
 */
module.exports = (config, app) => {
  require('fast-url-parser').replace()

  app.enable('trust proxy')
  app.use(bodyParser.json({type: config.get('mime_type')}))

  app.use(cors({
    origin: config.get('web_host'),
    exposedHeaders: [
      'cache-control',
      'connection',
      'content-length',
      'content-type',
      'location'
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
    if (/\/api/.test(req.url)) {
      res.header('Content-Type', CONTENT_TYPE)
    }
    next()
  })

  let environment = config.get('environment')
  let sendHttpProblem = sendHttpProblemFunc.bind(null, environment)

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
    sendHttpProblem
  }
}
