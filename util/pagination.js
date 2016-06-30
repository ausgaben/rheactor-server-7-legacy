'use strict'

const maxItemsPerPage = 100
const PaginatedResult = require('../model/paginated-result')

/**
 * @param {number} offset
 * @param {number} itemsPerPage
 * @constructor
 */
function Pagination (offset, itemsPerPage) {
  Object.defineProperty(this, 'offset', {value: Math.max(0, ~~offset || 0), enumerable: true})
  Object.defineProperty(this, 'itemsPerPage', {value: Math.min(Math.max(1, ~~itemsPerPage || 10), maxItemsPerPage), enumerable: true})
}

/**
 * splice the array based on the given pagination
 * Useful for selecting a page from a full list of ids
 *
 * @param {Array} list
 * @return {Array}
 */
Pagination.prototype.splice = function (list) {
  let self = this
  return list.splice(self.offset, self.itemsPerPage)
}

/**
 * Create a result based on this pagination
 *
 * @param {Array} items
 * @param {Number} total
 * @param {object} query The query object used for the result
 * @return PaginatedResult
 */
Pagination.prototype.result = function (items, total, query) {
  let self = this
  let prevOffset
  let nextOffset
  if (self.offset > 0) {
    prevOffset = self.offset - self.itemsPerPage
  }
  if (items.length === self.itemsPerPage && self.offset + self.itemsPerPage < total) {
    nextOffset = self.offset + self.itemsPerPage
  }
  return new PaginatedResult(items, total, self.itemsPerPage, self.offset, query, prevOffset, nextOffset)
}

module.exports = Pagination
