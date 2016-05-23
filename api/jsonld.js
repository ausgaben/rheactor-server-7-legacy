'use strict'

const _map = require('lodash/map')
const _clone = require('lodash/clone')
const _forEach = require('lodash/forEach')
const Relation = require('rheactor-web-app/js/model/relation')
const List = require('rheactor-web-app/js/model/list')

/**
 * @constructor
 */
const JSONLD = function () {
  this.typeLinks = {}
  this.typeMap = {}
}

/**
 * @param {string} $context
 * @param {URIValue} uri
 */
JSONLD.prototype.mapType = function ($context, uri) {
  let self = this
  self.typeMap[$context] = uri.toString()
}

/**
 * @param {string} type
 * @param {URIValue} uri
 * @param {string} context
 * @param {string} relation
 * @param {boolean} list
 */
JSONLD.prototype.addLink = function (type, uri, context, relation, list) {
  let self = this
  let link = {
    href: uri.toString()
  }
  if (context) {
    link.context = context
  }
  if (relation) {
    link.rel = relation
  }
  if (list) {
    link.list = true
  }
  if (!self.typeLinks[type]) {
    self.typeLinks[type] = []
  }
  self.typeLinks[type].push(link)
}

/**
 * @param {string} $context
 * @param {string} URL
 * @returns {string}
 */
JSONLD.prototype.createId = function ($context, id) {
  let self = this
  return self.typeMap[$context].replace(':id', id)
}

/**
 * @param {string} $context
 * @param {string} $id
 */
JSONLD.prototype.parseId = function ($context, $id) {
  let self = this
  return $id.match(new RegExp(self.typeMap[$context].replace(':id', '([0-9]+)')))[1]
}

JSONLD.prototype.createLinks = function ($context, idOrMap) {
  let self = this
  let links = []
  _map(self.typeLinks[$context], (link) => {
    let l = _clone(link)
    if (typeof idOrMap === 'object') {
      _forEach(idOrMap, (v, k) => {
        l.href = l.href.replace(':' + k, v)
      })
    } else {
      l.href = l.href.replace(':id', idOrMap)
    }
    links.push(new Relation(l))
  })
  return links
}

/**
 * @param {PaginatedResult} result
 * @param {String} urlTemplate
 * @return {Array.<Relation>}
 */
JSONLD.prototype.createPaginationLinks = function (result, urlTemplate) {
  let links = []
  links.push(new Relation({
    context: List.$context,
    list: true,
    rel: 'self',
    href: urlTemplate.replace(':offset', result.offset)
  }))
  if (result.nextOffset !== undefined) {
    links.push(new Relation({
      context: List.$context,
      list: true,
      rel: 'next',
      href: urlTemplate.replace(':offset', result.nextOffset)
    }))
  }
  if (result.prevOffset !== undefined) {
    links.push(new Relation({
      context: List.$context,
      list: true,
      rel: 'prev',
      href: urlTemplate.replace(':offset', result.prevOffset)
    }))
  }
  return links
}

JSONLD.prototype.index = function () {
  let self = this
  let links = []
  _map(self.typeLinks.index, (link) => {
    links.push(new Relation(link))
  })
  return links
}

/**
 * Use to turn $Id urls into strings that can be safely passed around
 *
 * @param {String} id
 * @returns {String}
 */
JSONLD.prototype.encodeId = function (id) {
  return new Buffer(encodeURI(encodeURIComponent(id)), 'binary').toString('base64')
}

module.exports = JSONLD
