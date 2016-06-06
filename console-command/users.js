'use strict'

module.exports = {
  description: 'list all users',
  action: (backend) => {
    return backend.repositories.user.findAll()
      .map((user) => {
        console.log('-', user.aggregateId(), user.name(), user.email.toString())
      })
  }
}
