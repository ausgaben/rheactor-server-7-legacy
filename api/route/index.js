'use strict'

/**
 * @param {express.app} app
 * @param {JSONLD} jsonld
 */
module.exports = (app, jsonld) => {
  app.get('/api', (req, res) => {
    let endpoints = jsonld.index()
    let index = {
      $context: 'https://github.com/RHeactor/nucleus/wiki/JsonLD#Index',
      $links: endpoints
    }
    res
      .header('Cache-Control', 'public, max-age=3600')
      .send(index)
  })
}
