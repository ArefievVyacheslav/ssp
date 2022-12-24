const server = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')


server.use(bodyParser.json(), cors())

server.post('/login', (req, res) => {
  const token = jwt.sign({ user: 'user name', admin: true }, 'ssp', { expiresIn: '30d' })
  try {
    if (!(req.body.name === 'ss' && req.body.pass === 'ss')) res.status(400).send('Пошёл нахуй')
    res.status(200).send({ accessToken: token })
  } catch (e) {
    res.status(400).send(e)
  }
})

server.listen(3002, () => console.log('SERVER ON 3002'))
