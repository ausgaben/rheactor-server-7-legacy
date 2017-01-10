'use strict'

/* global describe, it */

import {Pagination} from '../../../src/util/pagination'
import {expect} from 'chai'

describe('Pagination()', function () {
  it('should have default values', (done) => {
    let p = new Pagination()
    expect(p.offset).to.equal(0)
    expect(p.itemsPerPage).to.equal(10)
    done()
  })

  it('should not exceed max items per page', (done) => {
    let p = new Pagination(0, 101)
    expect(p.offset).to.equal(0)
    expect(p.itemsPerPage).to.equal(100)
    done()
  })

  it('should convert invalid values', (done) => {
    let p = new Pagination(-1, 0)
    expect(p.offset).to.equal(0)
    expect(p.itemsPerPage).to.equal(10)
    done()
  })
})
