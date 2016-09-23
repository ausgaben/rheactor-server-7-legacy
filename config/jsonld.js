'use strict'

const _trimEnd = require('lodash/trimEnd')
const User = require('rheactor-web-app/js/model/user')
const Token = require('rheactor-web-app/js/model/jsonwebtoken')
const Status = require('rheactor-web-app/js/model/status')
const JSONLD = require('../api/jsonld')
const URIValue = require('rheactor-value-objects/uri')

/**
 * @param apiHost
 * @return {JSONLD}
 */
module.exports = function (apiHost) {
  let apiBase = _trimEnd(apiHost, '/') + '/api'
  let jsonld = new JSONLD()

  jsonld.mapType(User.$context, new URIValue(apiBase + '/user/:id'))

  jsonld.addLink('index', new URIValue(apiBase + '/status'), Status.$context, 'status')
  jsonld.addLink('index', new URIValue(apiBase + '/login'), Token.$context, 'login')
  jsonld.addLink('index', new URIValue(apiBase + '/registration'), User.$context, 'register')
  jsonld.addLink('index', new URIValue(apiBase + '/password-change'), User.$context, 'password-change')
  jsonld.addLink('index', new URIValue(apiBase + '/password-change/confirm'), User.$context, 'password-change-confirm')
  jsonld.addLink('index', new URIValue(apiBase + '/activate-account'), User.$context, 'activate-account')
  jsonld.addLink('index', new URIValue(apiBase + '/avatar'), User.$context, 'avatar-upload')
  jsonld.addLink('index', new URIValue(apiBase + '/user'), User.$context, 'create-user')
  jsonld.addLink('index', new URIValue(apiBase + '/search/user'), User.$context, 'list-users', true)

  jsonld.addLink(Token.$context, new URIValue(apiBase + '/token/verify'), Token.$context, 'token-verify')
  jsonld.addLink(Token.$context, new URIValue(apiBase + '/token/renew'), Token.$context, 'token-renew')

  jsonld.addLink(User.$context, new URIValue(apiBase + '/user/:id/active'), User.$context, 'toggle-active')
  jsonld.addLink(User.$context, new URIValue(apiBase + '/user/:id/email'), User.$context, 'update-email')
  jsonld.addLink(User.$context, new URIValue(apiBase + '/user/:id/email-change'), User.$context, 'change-email')
  jsonld.addLink(User.$context, new URIValue(apiBase + '/user/:id/email-change/confirm'), User.$context, 'change-email-confirm')

  return jsonld
}
