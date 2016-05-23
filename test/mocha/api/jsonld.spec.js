'use strict'

/* global describe, it, before */

const expect = require('chai').expect
const JSONLD = require('../../../api/jsonld')
const URIValue = require('rheactor-value-objects/uri')
const Relation = require('rheactor-web-app/js/model/relation')

const UserContext = 'https://github.com/RHeactor/nucleus/wiki/JsonLD#User'
const ContributionContext = 'https://github.com/ResourcefulHumans/netwoRHk/wiki/JsonLD#Contribution'
const CommitmentContext = 'https://github.com/ResourcefulHumans/netwoRHk/wiki/JsonLD#Commitment'
const NetworhkContext = 'https://github.com/ResourcefulHumans/netwoRHk/wiki/JsonLD#netwoRHk'

describe('jsonld', function () {
  let jsonld

  before((done) => {
    jsonld = new JSONLD()
    jsonld.mapType(UserContext, new URIValue('http://example.com/api/user/:id'))
    jsonld.addLink(UserContext, new URIValue('http://example.com/api/user/:id/search/netwoRHk'), NetworhkContext, null, true)
    jsonld.addLink(ContributionContext, new URIValue('http://example.com/api/netwoRHk/:networhk_id/search/commitment?contribution=:id'), CommitmentContext, null, true)
    done()
  })

  describe('.createId()', () => {
    it('should create an $id link', (done) => {
      expect(jsonld.createId(UserContext, 42)).to.equal('http://example.com/api/user/42')
      expect(jsonld.createId(UserContext, 17)).to.equal('http://example.com/api/user/17')
      done()
    })
  })

  describe('.parseId()', () => {
    it('should parse an $id link', (done) => {
      expect(jsonld.parseId(UserContext, 'http://example.com/api/user/42')).to.equal('42')
      expect(jsonld.parseId(UserContext, 'http://example.com/api/user/17')).to.equal('17')
      done()
    })
  })

  describe('.createLinks()', () => {
    it('should create links', (done) => {
      expect(jsonld.createLinks(UserContext, 42)[0]).to.deep.equal(
        {
          '$context': Relation.$context,
          'context': NetworhkContext,
          'href': 'http://example.com/api/user/42/search/netwoRHk',
          'list': true,
          'rel': undefined
        }
      )
      expect(jsonld.createLinks(UserContext, 17)[0]).to.deep.equal(
        {
          '$context': Relation.$context,
          'context': NetworhkContext,
          'href': 'http://example.com/api/user/17/search/netwoRHk',
          'list': true,
          'rel': undefined
        }
      )
      done()
    })
    it('should create links for multiple ids', (done) => {
      expect(jsonld.createLinks(ContributionContext, {
        id: 17,
        networhk_id: 42
      })[0]).to.deep.equal(
        {
          '$context': Relation.$context,
          'context': CommitmentContext,
          'href': 'http://example.com/api/netwoRHk/42/search/commitment?contribution=17',
          'list': true,
          'rel': undefined
        }
      )
      done()
    })
  })
})
