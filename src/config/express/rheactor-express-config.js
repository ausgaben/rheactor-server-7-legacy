import passport from 'passport'
import {Strategy as BearerStrategy} from 'passport-http-bearer'
import tokenBearerStrategy from './token-bearer-strategy'
import JSONLD from '../jsonld'
import {verify} from '../../util/tokens'
import {transform} from '../../api/transformer'
import {rheactorExpressBaseConfig} from './base'
import {URIValue} from 'rheactor-value-objects'
import indexRoute from '../../api/route/index'
import statusRoute from '../../api/route/status'
import registrationRoute from '../../api/route/registration'
import tokenRoute from '../../api/route/token'
import loginRoute from '../../api/route/login'
import passwordChangeRoute from '../../api/route/password-change'
import profileRoute from '../../api/route/profile'
import activateAccountRoute from '../../api/route/activate-account'
import userRoute from '../../api/route/user'

/**
 * @param {express.app} app
 * @param {nconf} config
 * @param {object} webConfig
 * @param repositories
 * @param {BackendEmitter} emitter
 * @param {function} transformer
 * @param {JSONLD} jsonld
 */
export function rheactorExpressConfig (app, config, webConfig, repositories, emitter, transformer = transform, jsonld = undefined) {
  const apiHost = new URIValue(config.get('api_host'))
  if (!jsonld) {
    jsonld = JSONLD(apiHost)
  }

  const base = rheactorExpressBaseConfig(config.get('environment'), webConfig.mimeType, app)

  app.use(passport.initialize())
  let verifyToken = (token) => {
    return verify(apiHost, config.get('public_key'), token)
  }
  passport.use(new BearerStrategy(tokenBearerStrategy(verifyToken)))
  let tokenAuth = passport.authenticate('bearer', {session: false, failWithError: true})

  indexRoute(app, jsonld)
  statusRoute(app, config)
  registrationRoute(app, config, emitter, repositories.user, base.sendHttpProblem)
  tokenRoute(app, config, tokenAuth, jsonld, base.sendHttpProblem)
  loginRoute(app, config, repositories.user, jsonld, base.sendHttpProblem)
  passwordChangeRoute(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  profileRoute(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  activateAccountRoute(app, config, emitter, repositories.user, tokenAuth, base.sendHttpProblem)
  userRoute(app, config, emitter, repositories.user, tokenAuth, jsonld, base.sendHttpProblem, transformer.bind(null, jsonld))

  return {
    jsonld,
    tokenAuth,
    sendHttpProblem: base.sendHttpProblem,
    verifyToken
  }
}
