'use strict'

let List = require('rheactor-web-app/js/model/list')
let url = require('fast-url-parser')
let Promise = require('bluebird')
let _merge = require('lodash/merge')
let _trimEnd = require('lodash/trimEnd')

/**
 * @param {URIValue} apiHost
 * @param {Object} req
 * @param {Object} res
 * @param {String} context
 * @param {JSONLD} jsonld
 * @param {function} itemTransformer
 * @param {PaginatedResult} result
 * @returns {Promise.<TResult>}
 */
let sendPaginatedListResponse = (apiHost, req, res, context, jsonld, itemTransformer, result) => {
  return Promise
    .map(result.items, itemTransformer)
    .then((models) => {
      let parsedReqUrl = url.parse(req.url, true)
      delete parsedReqUrl.search
      parsedReqUrl._query = _merge(parsedReqUrl._query, result.query, {offset: ':offset'})
      let searchUrl = _trimEnd(apiHost.toString(), '/') + url.format(parsedReqUrl).replace('%3Aoffset', ':offset')
      searchUrl = _trimEnd(searchUrl, '&')
      let list = new List(
        context,
        models,
        result.total,
        result.offset,
        result.itemsPerPage,
        jsonld.createPaginationLinks(result, searchUrl)
      )
      res
        .send(list)
    })
}

module.exports = {
  sendPaginatedListResponse
}
