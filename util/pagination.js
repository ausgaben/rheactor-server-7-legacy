'use strict'

let maxItemsPerPage = 100

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

/**
 * Represents a paginated result
 *
 * @param {Array} items The actual items on the current page
 * @param {Number} total The total number of items
 * @param {Number} itemsPerPage The number of items per page
 * @param {Number} offset The offset of the current page
 * @param {object} query The query object used for the result
 * @param {Number|undefined} prevOffset If set represents the offset to use in order to fetch the previous page
 * @param {Number|undefined} nextOffset If set represents the offset to use in order to fetch the next page
 * @constructor
 */
function PaginatedResult (items, total, itemsPerPage, offset, query, prevOffset, nextOffset) {
  Object.defineProperty(this, 'items', {value: items, enumerable: true})
  Object.defineProperty(this, 'total', {value: total, enumerable: true})
  Object.defineProperty(this, 'itemsPerPage', {value: itemsPerPage, enumerable: true})
  Object.defineProperty(this, 'offset', {value: offset, enumerable: true})
  Object.defineProperty(this, 'query', {value: query, enumerable: true})
  Object.defineProperty(this, 'prevOffset', {value: prevOffset, enumerable: true})
  Object.defineProperty(this, 'nextOffset', {value: nextOffset, enumerable: true})
}

module.exports = Pagination
