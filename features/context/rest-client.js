'use strict'

let _forIn = require('lodash/forIn')
let _template = require('lodash/template')
let _filter = require('lodash/filter')
let _map = require('lodash/map')
let expect = require('chai').expect
let Yadda = require('yadda')
let English = Yadda.localisation.English
let dictionary = new Yadda.Dictionary()
let request = require('supertest')
let jwt = require('jsonwebtoken')
let utils = require('./util/storage')

dictionary
  .define('json', /([^\u0000]*)/, function (data, done) {
    done(null, data)
  })
  .define('text', /([^\u0000]*)/, function (data, done) {
    done(null, data)
  })
  .define('num', /(\d+)/, Yadda.converters.integer)

let testHost = 'http://localhost:8080'

function client (context) {
  if (!context.client) {
    context.client = request.agent(testHost)
  }
  return context.client
}

function doRequest (context, method, endpoint, next) {
  let agent = client(context)
  let url = utils.template(endpoint, utils.data(context))
  let localUrl = url.replace(testHost, '')
  let request = context.request = agent[method.toLowerCase()](localUrl)
  _forIn(utils.header(context), function (value, name) {
    request.set(name, value)
  })
  let body = utils.template(context.body, utils.data(context))
  if (process.env.DEBUG_REST) {
    console.log('>', method, localUrl)
  }
  request.send(JSON.stringify(JSON.parse('{' + body + '}')))
  request.end(function (error, response) {
    if (process.env.DEBUG_REST) {
      if (response && response.statusCode) {
        console.log('<', response.statusCode)
        if (response.statusCode >= 400) {
          console.log(response.body)
        }
      }
    }
    context.response = response
    context.error = error
    next()
  })
}

function checkJwtProperty (context, type, value, next) {
  expect(context.response.body.$context).to.equal('https://tools.ietf.org/html/rfc7519')
  jwt.verify(context.response.body.token, context.$app.config.get('public_key'), function (err, decoded) {
    if (err) {
      next(err)
    }
    try {
      if (typeof value === 'function') {
        value(decoded[type])
      } else {
        expect(decoded[type]).to.equal(value)
      }
    } catch (err) {
      next(err)
    }
  })
  next()
}

module.exports = {
  beforeScenario: (context) => {
    context.body = undefined
    context.header = {}
  },
  library: English.library(dictionary)

    .given('"$value" is the $header header', function (value, name, next) {
      let context = this.ctx
      utils.header(context, name, utils.template(value, utils.data(context)))
      next()
    })

    .given('this is the request body\n$json', function (json, next) {
      let context = this.ctx
      context.body = json
      next()
    })

    .given('the request body is empty', function (next) {
      let context = this.ctx
      context.body = undefined
      next()
    })

    .when('I $method to $endpoint', function (method, endpoint, next) {
      let context = this.ctx
      doRequest(context, method, endpoint, next)
    })

    .when('I GET $endpoint', function (endpoint, next) {
      let context = this.ctx
      doRequest(context, 'GET', endpoint, next)
    })

    .when('I store "$node" as "$storage"', function (node, storage, next) {
      let context = this.ctx
      utils.data(context, storage, context.response.body[node])
      next()
    })

    .when('I store "$node" of the ([0-9]+)[a-z]+ item as "$storage"', function (node, num, storage, next) {
      let context = this.ctx
      utils.data(context, storage, context.response.body.items[num - 1][node])
      next()
    })

    .when('I store the link to the list "$context" as "$storage"', function ($context, storage, next) {
      let context = this.ctx
      let matched = _filter(context.response.body.$links, (link) => {
        return link.list && link.context === $context
      })
      utils.data(context, storage, matched[0].href)
      next()
    })

    .when('I store the link to the list "$context" of the ([0-9]+)[a-z]+ item as "$storage"', function ($context, num, storage, next) {
      let context = this.ctx
      let matched = _filter(context.response.body.items[num - 1].$links, (link) => {
        return link.list && link.context === $context
      })
      utils.data(context, storage, matched[0].href)
      next()
    })

    .when('I store the link to "$relation" as "$storage"', function (relation, storage, next) {
      let context = this.ctx
      let matched = _filter(context.response.body.$links, (link) => {
        return link.rel === relation
      })
      utils.data(context, storage, matched[0].href)
      next()
    })

    .when('I store the link of "$relatedContext" as "$storage"', function (relatedContext, storage, next) {
      let context = this.ctx
      let matched = _filter(context.response.body.$links, (link) => {
        return link.context === relatedContext
      })
      utils.data(context, storage, matched[0].href)
      next()
    })

    .when('I store the link to "$relation" of the ([0-9]+)[a-z]+ item as "$storage"', function (relation, num, storage, next) {
      let context = this.ctx
      let matched = _filter(context.response.body.items[num - 1].$links, (link) => {
        return link.rel === relation
      })
      utils.data(context, storage, matched[0].href)
      next()
    })

    .when('I store the $header header as "$storage"', function (header, storage, next) {
      let context = this.ctx
      utils.data(context, storage, context.response.header[header.toLowerCase()])
      next()
    })

    .when('I follow the redirect', function (next) {
      let context = this.ctx
      let agent = client(context)
      let request = context.request = agent.get(context.response.header.location.replace(testHost, ''))
      _forIn(utils.header(context), function (value, name) {
        request.set(name, value)
      })
      request.send()
      request.end(function (error, response) {
        context.response = response
        context.error = error
        next()
      })
    })

    .then('the status code should be $num', function (status, next) {
      let context = this.ctx
      if (!context.response) {
        return next(new Error('No HTTP response received from\nRequest:  ' + context.request.method + ' ' + context.request.url))
      }
      try {
        expect(context.response.statusCode).to.equal(status)
        next()
      } catch (err) {
        next(new Error('Unexpected HTTP response status\nExpected: ' + status + '\nGot:      ' + context.response.statusCode + '\nRequest:  ' + context.request.method + ' ' + context.request.url))
      }
    })

    .then('the $header header should equal "$value"', function (name, value, next) {
      let context = this.ctx
      expect(context.response.header[name.toLowerCase()]).to.equal(value)
      next()
    })

    .then('the $header header should exist', function (name, next) {
      let context = this.ctx
      expect(context.response.header[name.toLowerCase()]).to.not.equal(undefined)
      next()
    })

    .then('"$node" should equal "$value"', function (node, value, next) {
      let context = this.ctx
      value = utils.template(value, utils.data(context))
      let data = context.response.body[node]
      if (/\./.test(node)) { // if child nodes are addressed via "parent.child" notation, use templating
        data = _template('{' + node + '}', {interpolate: /\{([\s\S]+?)\}/g})(context.response.body)
      }
      expect(data).to.equal(value)
      next()
    })

    .then('"$node" should not equal "$value"', function (node, value, next) {
      let context = this.ctx
      value = utils.template(value, utils.data(context))
      expect(context.response.body[node]).to.not.equal(value)
      next()
    })

    .then(/"([^"]+)" should equal ([+0-9,\.-]+)/, function (node, number, next) {
      let context = this.ctx
      expect(context.response.body[node]).to.equal(+number)
      next()
    })

    .then(/"([^"]+)" should equal (true|false)/, function (node, bool, next) {
      let context = this.ctx
      expect(context.response.body[node]).to.equal(bool === 'true')
      next()
    })

    .given('"$node" should equal\n$text', function (node, text, next) {
      let context = this.ctx
      expect(context.response.body[node]).to.equal(text)
      next()
    })

    .then('"$node" should exist', function (node, next) {
      let context = this.ctx
      expect(context.response.body[node]).to.not.equal(undefined)
      next()
    })

    .then('"$node" should not exist', function (node, next) {
      let context = this.ctx
      expect(context.response.body[node]).to.equal(undefined)
      next()
    })

    .then(/a list of "([^"]+)" with ([0-9]+) of ([0-9]+) items? should be returned/, function (itemContext, num, total, next) {
      let context = this.ctx
      let list = context.response.body
      expect(list.$context).to.equal('https://github.com/RHeactor/nucleus/wiki/JsonLD#List')
      expect(list.total).to.equal(+total)
      expect(list.items.length).to.equal(+num)
      _map(list.items, function (item) {
        expect(item.$context).to.equal(itemContext)
      })
      next()
    })

    .then(/a list of "([^"]+)" should be returned/, function (itemContext, next) {
      let context = this.ctx
      let list = context.response.body
      expect(list.$context).to.equal('https://github.com/RHeactor/nucleus/wiki/JsonLD#List')
      _map(list.items, function (item) {
        expect(item.$context).to.equal(itemContext)
      })
      next()
    })

    .then('I filter the list by $property equals (true|false)', function (property, bool, next) {
      let context = this.ctx
      context.response.body.items = _filter(context.response.body.items, (item) => {
        return item[property] === (bool === 'true')
      })
      context.response.body.__filtered = true
      next()
    })

    .then(/I filter the list by ([^ ]+) contains "([^"]+)/, function (property, text, next) {
      let context = this.ctx
      text = utils.template(text, utils.data(context))
      context.response.body.items = _filter(context.response.body.items, (item) => {
        let data = item[property]
        if (/\./.test(property)) { // if child nodes are addressed via "parent.child" notation, use templating
          data = _template('{' + property + '}', {interpolate: /\{([\s\S]+?)\}/g})(item)
        }
        return data.search(text) >= 0
      })
      context.response.body.__filtered = true
      next()
    })

    .then(/"([^"]+)" of the ([0-9]+)[a-z]+ item should equal "([^"]+)"/, function (node, num, value, next) {
      let context = this.ctx
      value = utils.template(value, utils.data(context))
      let data = context.response.body.items[num - 1][node]
      if (/\./.test(node)) { // if child nodes are addressed via "parent.child" notation, use templating
        data = _template('{' + node + '}', {interpolate: /\{([\s\S]+?)\}/g})(context.response.body.items[num - 1])
      }
      expect(data).to.equal(value)
      next()
    })

    .then(/"([^"]+)" of the ([0-9]+)[a-z]+ item should equal (true|false)/, function (node, num, bool, next) {
      let context = this.ctx
      expect(context.response.body.items[num - 1][node]).to.equal(bool === 'true')
      next()
    })

    .then(/"([^"]+)" of the ([0-9]+)[a-z]+ item should equal ([+0-9,\.-]+)/, function (node, num, number, next) {
      let context = this.ctx
      expect(context.response.body.items[num - 1][node]).to.equal(+number)
      next()
    })

    .then('JWT $property should exist', function (property, next) {
      let context = this.ctx
      checkJwtProperty(context, property, function (value) {
        expect(value).to.not.equal(undefined)
      }, next)
    })

    .then('JWT $property should equal "$value"', function (property, value, next) {
      let context = this.ctx
      value = utils.template(value, utils.data(context))
      checkJwtProperty(context, property, value, next)
    })

    .then(/JWT ([^ ]+) should equal (true|false)/, function (property, bool, next) {
      let context = this.ctx
      checkJwtProperty(context, property, bool === 'true', next)
    })

    .then(/JWT ([^ ]+) should be ([0-9]+) ([a-z]+) in the (future|past)/, function (property, num, type, dir, next) {
      let context = this.ctx
      let d = new Date()
      let m = 1
      if (type.charAt(0) === 'm') {
        m = 60
      }
      if (type.charAt(0) === 'h') {
        m = 3600
      }
      let t = Math.floor(d.getTime() / 1000) + (dir === 'past' ? -1 : 1) * +num * m
      checkJwtProperty(context, property, function (value) {
        expect(value).to.be.within(t - 1, t + 1)
      }, next)
    })

    .then('I parse JWT token into "$name"', function (name, next) {
      let context = this.ctx
      utils.data(context, name, JSON.parse(new Buffer(context.response.body.token.split('.')[1], 'base64').toString('binary')))
      next()
    })

    // Debug stuff
    .then('I print the response', function (next) {
      let context = this.ctx
      if (context.response.body.$context && context.response.body.$context === 'https://github.com/RHeactor/nucleus/wiki/JsonLD#List') {
        console.log('List containing', context.response.body.items.length, 'of', context.response.body.total, 'items of', context.response.body.context)
        console.log('Links:')
        console.log(context.response.body.$links)
        console.log('Items:')
        console.log(context.response.body.items)
      } else {
        console.log(context.response.body)
      }
      next()
    })
}
