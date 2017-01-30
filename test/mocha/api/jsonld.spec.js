/* global describe, it, before */

import {expect} from 'chai'
import {JSONLD} from '../../../src/api/jsonld'
import {URIValue} from 'rheactor-value-objects'
import {Link} from 'rheactor-models'

const UserContext = new URIValue('https://github.com/ResourcefulHumans/rheactor-models#User')
const ContributionContext = new URIValue('https://github.com/ResourcefulHumans/netwoRHk/wiki/JsonLD#Contribution')
const CommitmentContext = new URIValue('https://github.com/ResourcefulHumans/netwoRHk/wiki/JsonLD#Commitment')
const NetworhkContext = new URIValue('https://github.com/ResourcefulHumans/netwoRHk/wiki/JsonLD#netwoRHk')

describe('jsonld', function () {
  let jsonld

  before(() => {
    jsonld = new JSONLD()
    jsonld.mapType(UserContext, new URIValue('http://example.com/api/user/:id'))
    jsonld.addLink(UserContext, new Link(new URIValue('http://example.com/api/user/:id/search/netwoRHk'), NetworhkContext, true))
    jsonld.addLink(ContributionContext, new Link(new URIValue('http://example.com/api/netwoRHk/:networhk_id/search/commitment?contribution=:id'), CommitmentContext, true))
  })

  describe('.createId()', () => {
    it('should create an $id link', () => {
      expect(jsonld.createId(UserContext, '42').equals(new URIValue('http://example.com/api/user/42'))).to.equal(true)
      expect(jsonld.createId(UserContext, '17').equals(new URIValue('http://example.com/api/user/17'))).to.equal(true)
    })
  })

  describe('.parseId()', () => {
    it('should parse an $id link', () => {
      expect(jsonld.parseId(UserContext, new URIValue('http://example.com/api/user/42'))).to.equal('42')
      expect(jsonld.parseId(UserContext, new URIValue('http://example.com/api/user/17'))).to.equal('17')
    })
  })

  describe('.createLinks()', () => {
    it('should create links', () => {
      const links42 = jsonld.createLinks(UserContext, '42')
      expect(links42[0].$context.equals(Link.$context)).to.equal(true)
      expect(links42[0].subject.equals(NetworhkContext)).to.equal(true)
      expect(links42[0].href.equals(new URIValue('http://example.com/api/user/42/search/netwoRHk'))).to.equal(true)
      expect(links42[0].list).to.equal(true)
      expect(links42[0].rel).to.equal(undefined)
      const links17 = jsonld.createLinks(UserContext, '17')
      expect(links17[0].$context.equals(Link.$context)).to.equal(true)
      expect(links17[0].subject.equals(NetworhkContext)).to.equal(true)
      expect(links17[0].href.equals(new URIValue('http://example.com/api/user/17/search/netwoRHk'))).to.equal(true)
      expect(links17[0].list).to.equal(true)
      expect(links17[0].rel).to.equal(undefined)
    })
    it('should create links for multiple ids', () => {
      const links = jsonld.createLinks(ContributionContext, {
        id: '17',
        networhk_id: '42'
      })
      expect(links[0].$context.equals(Link.$context)).to.equal(true)
      expect(links[0].subject.equals(CommitmentContext)).to.equal(true)
      expect(links[0].href.equals(new URIValue('http://example.com/api/netwoRHk/42/search/commitment?contribution=17'))).to.equal(true)
      expect(links[0].list).to.equal(true)
      expect(links[0].rel).to.equal(undefined)
    })
  })
})
