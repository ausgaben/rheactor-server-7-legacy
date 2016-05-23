'use strict'

/* global describe, it, before */

let Promise = require('bluebird')
let helper = require('../helper')
let expect = require('chai').expect
let UserCreateCommand = require('../../../command/user/create')
let EmailValue = require('rheactor-value-objects/email')
let UserModel = require('../../../model/user')

describe('UserRepository', function () {
  before(helper.clearDb)

  let repository = helper.repositories.user
  let emitter = require('../../../services/emitter')

  let findByEmailRetry = (email) => {
    return repository.findByEmail(email)
      .then((user) => {
        if (!user) {
          return Promise.delay(500).then(findByEmailRetry.bind(null, email))
        }
        return user
      })
  }

  describe('persist', () => {
    it('should persist UserCreateCommands', (done) => {
      let email1 = new EmailValue('john.doe@example.invalid')
      let email2 = new EmailValue('jane.doe@example.invalid')

      let c1 = new UserCreateCommand(email1, 'John', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')
      let c2 = new UserCreateCommand(email2, 'Jane', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')

      Promise.join(emitter.emit(c1), emitter.emit(c2))
        .spread((e1, e2) => {
          let u1 = e1.user
          let u2 = e2.user
          expect(u1).to.be.instanceof(UserModel)
          expect(u2).to.be.instanceof(UserModel)
          expect(u1.email.toString()).to.equal('john.doe@example.invalid')
          expect(u1.aggregateVersion()).to.equal(1)
          expect(u2.email.toString()).to.equal('jane.doe@example.invalid')
          expect(u2.aggregateVersion()).to.equal(1)
          done()
        })
    })

    it('should not persist two users with the same email address', (done) => {
      let email = new EmailValue('jill.doe@example.invalid')

      let c1 = new UserCreateCommand(email, 'Jill', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')
      let c2 = new UserCreateCommand(email, 'Another Jill', 'Doe', '$2a$04$If4tCFhzOBCiKuOYX3gSje918gyr4XN73BFtSpuJAFZjUE.5NR3PS')

      emitter.emit(c1)
      emitter
        .emit(c2)
        .catch((err) => {
          expect(err.name).to.be.equal('EntryAlreadyExistsError')
          expect(err.message).to.be.contain('jill.doe@example.invalid')
          done()
        })
    })
  })

  describe('.getById()', () => {
    it('should return UserModels', (done) => {
      let email = new EmailValue('john.doe@example.invalid')
      findByEmailRetry(email)
        .then((user) => {
          return repository.getById(user.aggregateId())
        })
        .then((user) => {
          expect(user).to.be.instanceof(UserModel)
          done()
        })
    })
  })

  describe('.findById()', () => {
    it('should return UserModels', (done) => {
      let email = new EmailValue('john.doe@example.invalid')
      findByEmailRetry(email)
        .then((user) => {
          return repository.findById(user.aggregateId())
        })
        .then((user) => {
          expect(user).to.be.instanceof(UserModel)
          done()
        })
    })
  })
})
