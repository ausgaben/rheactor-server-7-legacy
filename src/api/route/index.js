/**
 * @param {express.app} app
 * @param {JSONLD} jsonld
 */
export default (app, jsonld) => {
  app.get('/api', (req, res) => {
    res
      .header('Cache-Control', 'public, max-age=3600')
      .send(jsonld.index())
  })
}
