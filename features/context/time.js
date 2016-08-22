'use strict'

const Yadda = require('yadda')
const English = Yadda.localisation.English
const dictionary = new Yadda.Dictionary()
const lolex = require('lolex')
const moment = require('moment')
const ValidationFailedError = require('rheactor-value-objects/errors/validation-failed')
const expect = require('chai').expect

var clock
module.exports = {
  library: English.library(dictionary)
    .given('we are $num days in the $direction', function (num, direction, next) {
      switch (direction) {
        case 'future':
          clock = lolex.install(moment().add(num, 'days').valueOf())
          break
        case 'past':
          clock = lolex.install(moment().subtract(num, 'days').valueOf())
          break
        default:
          throw new ValidationFailedError('Invalid direction: ' + direction)
      }
      next()
    })
    .given('we are back to the present', function (next) {
      clock.uninstall()
      next()
    })
    .then('"$node" should be $num days in the $direction', function (node, num, direction, next) {
      const context = this.ctx
      switch (direction) {
        case 'future':
          expect(Math.round(moment.duration(+context.response.body[node] - Date.now()).asDays())).to.equal(+num)
          break
        case 'past':
          expect(Math.round(moment.duration(Date.now() - +context.response.body[node]).asDays())).to.equal(-num)
          break
        default:
          throw new ValidationFailedError('Invalid direction: ' + direction)
      }
      next()
    })
    .then('"$node" should be now', function (node, next) {
      const context = this.ctx
      expect(Math.round(moment.duration(+context.response.body[node] - Date.now()).asSeconds())).to.equal(0)
      next()
    })
    .then('the $header header should be now', function (header, next) {
      const context = this.ctx
      expect(Math.round(moment.duration(+context.response.header[header.toLowerCase()] - Date.now()).asSeconds())).to.equal(0)
      next()
    })
}
