'use strict'

const AccessDeniedError = require('rheactor-value-objects/errors/access-denied')

module.exports = (req, userRepo) => userRepo.getById(req.user)
  .then(admin => {
    if (!admin.superUser) throw new AccessDeniedError(req.url, 'SuperUser privileges required.')
    return admin
  })
