import Promise from 'bluebird'
import bcrypt from 'bcrypt'
Promise.promisifyAll(bcrypt)
import jwt from 'jsonwebtoken'
import {JsonWebToken, User} from 'rheactor-models'

export default (app, config, tokenAuth, jsonld, sendHttpProblem) => {
  app.post('/api/token/verify', tokenAuth, function (req, res) {
    return res
      .status(204)
      .send()
  })
  app.post('/api/token/renew', tokenAuth, function (req, res) {
    Promise
      .try(() => {
        return jwt.sign(
          {},
          config.get('private_key'),
          {
            algorithm: 'RS256',
            issuer: 'renew',
            subject: jsonld.createId(User.$context, req.user).toString(),
            expiresIn: config.get('token_lifetime')
          }
        )
      })
      .then((token) => {
        return res
          .status(201)
          .send(new JsonWebToken(token, jsonld.createLinks(JsonWebToken.$context, token)))
      })
      .catch(function (err) {
        err.punish = true
        return sendHttpProblem(res, err)
      })
  })
}
