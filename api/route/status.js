'use strict'

var Status = require('rheactor-web-app/js/model/status')

module.exports = function (app, config) {
  app.get('/api/status', function (req, res) {
    res
      .status(200)
      .send(new Status({
        status: 'ok',
        environment: config.get('environment'),
        version: config.get('version')
      }))
  })
}
