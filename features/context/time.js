'use strict'

const Yadda = require('yadda')
const English = Yadda.localisation.English
const dictionary = new Yadda.Dictionary()
const lolex = require('lolex')
const moment = require('moment')
const ValidationFailedException = require('rheactor-value-objects/errors/validation-failed')
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
          throw new ValidationFailedException('Invalid direction: ' + direction)
      }
      next()
    })
    .given('we are back', function (next) {
      clock.uninstall()
      next()
    })
    .then('"$node" should be $num days in the $direction', function (node, num, direction, next) {
      const context = this.ctx
      switch (direction) {
        case 'future':
          expect(Math.round(moment.duration(Date.now() - +context.response.body[node]).asDays())).to.equal(num)
          break
        case 'past':
          expect(Math.round(moment.duration(Date.now() - +context.response.body[node]).asDays())).to.equal(-num)
          break
        default:
          throw new ValidationFailedException('Invalid direction: ' + direction)
      }
      next()
    })
}
