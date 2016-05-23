'use strict'

let Joi = require('joi')
let ValidationFailedException = require('rheactor-value-objects/errors').ValidationFailedException

let schema = Joi.object().keys({
  items: Joi.array().required(),
  total: Joi.number().min(0).required(),
  nextIndex: Joi.string().trim(),
  prevIndex: Joi.string().trim()
})

/**
 * @param {Array} items
 * @param {Number} total
 * @param {String} nextIndex
 * @param {String} prevIndex
 * @constructor
 * @throws ValidationFailedException if the creation fails due to invalid data
 */
function ListResultModel (items, total, nextIndex, prevIndex) {
  Joi.validate({items, total, nextIndex, prevIndex}, schema, (err, data) => {
    if (err) {
      throw new ValidationFailedException('ListResultModel validation failed', data, err)
    }
  })
  this.items = items
  this.nextIndex = nextIndex
  this.prevIndex = prevIndex
  this.total = total
}

module.exports = ListResultModel
