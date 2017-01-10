import colors from 'colors'

export default {
  description: 'list all users',
  action: (backend) => {
    return backend.repositories.user.findAll()
      .map((user) => {
        console.log(
          '-',
          user.aggregateId(),
          user.superUser ? colors.blue('^') : ' ',
          user.name(),
          user.email.toString(),
          user.isActive ? colors.green('[active]') : colors.red('[inactive]')
        )
      })
  }
}
