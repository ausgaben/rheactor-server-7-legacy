import Promise from 'bluebird'
import JsonWebTokenError from 'jsonwebtoken/lib/JsonWebTokenError'
import {TokenExpiredError} from '@resourcefulhumans/rheactor-errors'

export default (verifyToken) => {
  return (token, cb) => {
    return Promise
      .resolve(verifyToken(token))
      .then((t) => {
        return cb(null, t.payload.sub_id, t)
      })
      .catch(TokenExpiredError, JsonWebTokenError, () => {
        return cb(null, false)
      })
      .catch((err) => {
        return cb(err)
      })
  }
}
